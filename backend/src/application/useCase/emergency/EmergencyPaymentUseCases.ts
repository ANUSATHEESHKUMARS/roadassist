import type { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import type {
    IEmergencyEstimateRepository,
    IEmergencyPaymentRepository,
} from "../../../domain/repositories/IEmergencyWorkflowRepositories.js";
import { EmergencyPayment } from "../../../domain/User/entities/EmergencyWorkflow.js";
import type { ITransactionManager } from "../../../infrastructure/databases/interface/IMongoTransactionManger.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { getBookingCurrency } from "../../constants/bookingConfig.js";
import type { IPaymentGateway } from "../../contracts/IPaymentGateway.js";
import type {
    CreateEmergencyPaymentOrderResponseDto,
    VerifyEmergencyPaymentDto,
    VerifyEmergencyPaymentResponseDto,
} from "../../dtos/emergency/EmergencyWorkflowDtos.js";
import type {
    ICreateEmergencyPaymentOrderUseCase,
    IVerifyEmergencyPaymentUseCase,
} from "../../interfaces/emergency/IEmergencyWorkflowUseCases.js";
import type { IMechanicNotificationService } from "../../interfaces/mechanic/IMechanicNotificationService.js";

export class EmergencyPaymentSettlementHelper {
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly estimateRepository: IEmergencyEstimateRepository,
        private readonly emergencyPaymentRepository: IEmergencyPaymentRepository,
        private readonly transactionManager: ITransactionManager,
        private readonly notificationService?: IMechanicNotificationService
    ) {}

    async settlePaidPayment(input: {
        payment: EmergencyPayment;
        razorpayPaymentId: string;
        razorpaySignature?: string;
    }): Promise<VerifyEmergencyPaymentResponseDto> {
        const { payment, razorpayPaymentId, razorpaySignature } = input;
        const now = new Date();

        const settled = await this.transactionManager.execute(async (tx) => {
            const freshPayment = await this.emergencyPaymentRepository.findById(
                payment.id!,
                tx
            );
            const freshEstimate = await this.estimateRepository.findById(
                payment.estimateId,
                tx
            );

            if (!freshPayment || !freshEstimate) {
                throw new ConflictError(
                    "Emergency payment or estimate record missing during settlement",
                    "EMERGENCY_SETTLEMENT_MISSING"
                );
            }

            if (freshPayment.status === "paid" && freshEstimate.status === "paid") {
                return { payment: freshPayment, estimate: freshEstimate, newlyPaid: false };
            }

            if (
                freshEstimate.status !== "approved" &&
                freshEstimate.status !== "paid"
            ) {
                throw new ConflictError(
                    `Cannot settle payment for estimate in status '${freshEstimate.status}'`,
                    "INVALID_ESTIMATE_PAYMENT_STATE"
                );
            }

            const paidPayment =
                freshPayment.status === "paid"
                    ? freshPayment
                    : await this.emergencyPaymentRepository.updateStatusWithGuard(
                          freshPayment.id!,
                          ["pending", "processing", "failed"],
                          "paid",
                          {
                              razorpayPaymentId,
                              ...(razorpaySignature !== undefined
                                  ? { razorpaySignature }
                                  : {}),
                              paidAt: now,
                          },
                          tx
                      );

            if (!paidPayment) {
                throw new ConflictError(
                    "Concurrent emergency payment update detected",
                    "PAYMENT_STATE_CONFLICT"
                );
            }

            const paidEstimate =
                freshEstimate.status === "paid"
                    ? freshEstimate
                    : await this.estimateRepository.updateStatusWithGuard(
                          freshEstimate.id!,
                          ["approved"],
                          "paid",
                          { paidAt: now },
                          tx
                      );

            if (!paidEstimate) {
                throw new ConflictError(
                    "Concurrent estimate update detected during payment settlement",
                    "ESTIMATE_STATE_CONFLICT"
                );
            }

            return { payment: paidPayment, estimate: paidEstimate, newlyPaid: true };
        });

        if (settled.newlyPaid && this.notificationService) {
            const request = await this.emergencyRequestRepository.findById(
                settled.payment.emergencyRequestId
            );
            if (request) {
                await Promise.allSettled([
                    this.notificationService.notifyCustomerRequestUpdated(
                        request,
                        {
                            eventName: "emergency_payment_updated",
                            extraPayload: {
                                estimate: settled.estimate.toObject(),
                                payment: {
                                    paymentId: settled.payment.id,
                                    status: settled.payment.status,
                                    amount: settled.payment.amount,
                                    currency: settled.payment.currency,
                                    razorpayOrderId: settled.payment.razorpayOrderId,
                                    razorpayPaymentId: settled.payment.razorpayPaymentId,
                                    paidAt: settled.payment.paidAt,
                                },
                            },
                        }
                    ),
                    request.assignedMechanicId
                        ? this.notificationService.notifyMechanicRequestUpdated(
                              request.assignedMechanicId,
                              request.id!,
                              "emergency_payment_updated",
                              {
                                  estimate: settled.estimate.toObject(),
                                  payment: {
                                      paymentId: settled.payment.id,
                                      status: settled.payment.status,
                                      amount: settled.payment.amount,
                                      currency: settled.payment.currency,
                                      paidAt: settled.payment.paidAt,
                                  },
                              }
                          )
                        : Promise.resolve(),
                ]);
            }
        }

        return {
            emergencyRequestId: settled.payment.emergencyRequestId,
            estimateId: settled.estimate.id!,
            estimateStatus: settled.estimate.status,
            paymentId: settled.payment.id!,
            paymentStatus: settled.payment.status,
            razorpayOrderId: settled.payment.razorpayOrderId,
            razorpayPaymentId:
                settled.payment.razorpayPaymentId ?? razorpayPaymentId,
            amount: settled.payment.amount,
            currency: settled.payment.currency,
            ...(settled.payment.paidAt !== undefined
                ? { paidAt: settled.payment.paidAt }
                : {}),
        };
    }
}

export class CreateEmergencyPaymentOrderUseCase
    implements ICreateEmergencyPaymentOrderUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly estimateRepository: IEmergencyEstimateRepository,
        private readonly emergencyPaymentRepository: IEmergencyPaymentRepository,
        private readonly paymentGateway: IPaymentGateway
    ) {}

    async execute(
        requestId: string,
        userId: string
    ): Promise<CreateEmergencyPaymentOrderResponseDto> {
        if (!requestId || !requestId.trim()) {
            throw new BadRequest("Request ID is required");
        }

        const request = await this.emergencyRequestRepository.findById(requestId);
        if (!request) {
            throw new NotfoundError("Emergency request not found");
        }
        if (request.userId !== userId) {
            throw new ForbiddenError(
                "Only the emergency request customer can initiate payment"
            );
        }
        if (request.status === "cancelled" || request.status === "completed") {
            throw new ConflictError(
                "Payment cannot be initiated for a closed emergency request"
            );
        }
        if (!request.assignedMechanicId) {
            throw new ConflictError("No mechanic is assigned to this request");
        }

        const latestEstimate =
            await this.estimateRepository.findLatestByEmergencyRequestId(
                requestId
            );
        if (!latestEstimate || !latestEstimate.id) {
            throw new NotfoundError(
                "No submitted estimate found for this emergency request",
                "ESTIMATE_NOT_FOUND"
            );
        }

        if (latestEstimate.status === "paid") {
            throw new ConflictError(
                "Approved estimate has already been paid",
                "ESTIMATE_ALREADY_PAID"
            );
        }

        if (latestEstimate.status !== "approved") {
            throw new ConflictError(
                "Approve the latest estimate revision before paying",
                "ESTIMATE_NOT_APPROVED"
            );
        }

        const amountInr = latestEstimate.totalAmount;
        const amountPaise = Math.round(amountInr * 100);
        const currency = getBookingCurrency();

        const existingPayment =
            await this.emergencyPaymentRepository.findLatestByEstimateId(
                latestEstimate.id
            );

        if (
            existingPayment &&
            existingPayment.status === "pending" &&
            existingPayment.amountPaise === amountPaise
        ) {
            return {
                emergencyRequestId: requestId,
                estimateId: latestEstimate.id,
                estimateRevision: latestEstimate.revision,
                paymentId: existingPayment.id!,
                razorpayOrderId: existingPayment.razorpayOrderId,
                amount: existingPayment.amount,
                amountPaise: existingPayment.amountPaise,
                currency: existingPayment.currency,
                keyId: this.paymentGateway.getKeyId(),
            };
        }

        if (existingPayment && existingPayment.status === "paid") {
            throw new ConflictError("Payment already completed for this estimate");
        }

        const receipt = `em_${requestId.slice(-10)}_r${latestEstimate.revision}`;
        const order = await this.paymentGateway.createOrder({
            amountPaise,
            currency,
            receipt,
            notes: {
                paymentDomain: "emergency",
                emergencyRequestId: requestId,
                estimateId: latestEstimate.id,
                revision: String(latestEstimate.revision),
                customerId: request.userId,
                mechanicId: request.assignedMechanicId,
            },
        });

        const idempotencyKey = `em_pay_${latestEstimate.id}_${Date.now()}`;
        const created = await this.emergencyPaymentRepository.create(
            new EmergencyPayment({
                emergencyRequestId: requestId,
                estimateId: latestEstimate.id,
                estimateRevision: latestEstimate.revision,
                customerId: request.userId,
                mechanicId: request.assignedMechanicId,
                amount: amountInr,
                amountPaise,
                currency,
                razorpayOrderId: order.orderId,
                status: "pending",
                idempotencyKey,
            })
        );

        return {
            emergencyRequestId: requestId,
            estimateId: latestEstimate.id,
            estimateRevision: latestEstimate.revision,
            paymentId: created.id!,
            razorpayOrderId: created.razorpayOrderId,
            amount: created.amount,
            amountPaise: created.amountPaise,
            currency: created.currency,
            keyId: this.paymentGateway.getKeyId(),
        };
    }
}

export class VerifyEmergencyPaymentUseCase
    implements IVerifyEmergencyPaymentUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly emergencyPaymentRepository: IEmergencyPaymentRepository,
        private readonly paymentGateway: IPaymentGateway,
        private readonly settlementHelper: EmergencyPaymentSettlementHelper
    ) {}

    async execute(
        requestId: string,
        userId: string,
        dto: VerifyEmergencyPaymentDto
    ): Promise<VerifyEmergencyPaymentResponseDto> {
        if (
            !requestId ||
            !dto?.razorpayOrderId?.trim() ||
            !dto?.razorpayPaymentId?.trim() ||
            !dto?.razorpaySignature?.trim()
        ) {
            throw new BadRequest(
                "Missing Razorpay verification fields",
                "INVALID_VERIFICATION_PAYLOAD"
            );
        }

        const request = await this.emergencyRequestRepository.findById(requestId);
        if (!request) {
            throw new NotfoundError("Emergency request not found");
        }
        if (request.userId !== userId) {
            throw new ForbiddenError(
                "You are not authorized to verify payment for this request"
            );
        }

        const payment =
            await this.emergencyPaymentRepository.findByRazorpayOrderId(
                dto.razorpayOrderId.trim()
            );

        if (!payment || payment.emergencyRequestId !== requestId) {
            throw new NotfoundError(
                "Payment order not found for this emergency request",
                "EMERGENCY_PAYMENT_NOT_FOUND"
            );
        }

        if (payment.status === "paid") {
            return this.settlementHelper.settlePaidPayment({
                payment,
                razorpayPaymentId:
                    payment.razorpayPaymentId ?? dto.razorpayPaymentId.trim(),
            });
        }

        const signatureValid = this.paymentGateway.verifyPaymentSignature({
            orderId: dto.razorpayOrderId.trim(),
            paymentId: dto.razorpayPaymentId.trim(),
            signature: dto.razorpaySignature.trim(),
        });

        if (!signatureValid) {
            throw new BadRequest(
                "Invalid Razorpay payment signature",
                "INVALID_PAYMENT_SIGNATURE"
            );
        }

        const gatewayPayment = await this.paymentGateway.fetchPayment(
            dto.razorpayPaymentId.trim()
        );

        if (gatewayPayment.orderId !== payment.razorpayOrderId) {
            throw new BadRequest(
                "Payment order ID mismatch",
                "PAYMENT_ORDER_MISMATCH"
            );
        }

        if (
            gatewayPayment.amount !== payment.amountPaise ||
            gatewayPayment.currency.toUpperCase() !==
                payment.currency.toUpperCase()
        ) {
            throw new BadRequest(
                "Payment amount or currency mismatch",
                "PAYMENT_AMOUNT_MISMATCH"
            );
        }

        if (
            gatewayPayment.status !== "captured" &&
            gatewayPayment.status !== "authorized" &&
            !gatewayPayment.captured
        ) {
            throw new ConflictError(
                `Payment has not settled at gateway (status: ${gatewayPayment.status})`,
                "PAYMENT_NOT_SETTLED"
            );
        }

        return this.settlementHelper.settlePaidPayment({
            payment,
            razorpayPaymentId: dto.razorpayPaymentId.trim(),
            razorpaySignature: dto.razorpaySignature.trim(),
        });
    }
}

