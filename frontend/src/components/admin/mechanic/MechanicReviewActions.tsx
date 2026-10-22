// import React, { useState } from "react";
// import { Check, X, AlertTriangle, Loader2 } from "lucide-react";
// import type { MechanicApplicationDTO } from "@/types/admin/mechanic";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";

// interface MechanicReviewActionsProps {
//   application: MechanicApplicationDTO;
//   onApprove: () => Promise<void>;
//   onReject: (reason: string) => Promise<void>;
//   onRequestChanges: (instructions: string) => Promise<void>;
//   isProcessing?: boolean;
// }

// export const MechanicReviewActions: React.FC<MechanicReviewActionsProps> = ({
//   application,
//   onApprove,
//   onReject,
//   onRequestChanges,
//   isProcessing = false,
// }) => {
//   const [modal, setModal] = useState<"approve" | "reject" | "changes" | null>(null);
//   const [rejectReason, setRejectReason] = useState("");
//   const [changesText, setChangesText] = useState("");
//   const [validationError, setValidationError] = useState<string | null>(null);

//   const isFinalized = application.status === "approved" || application.status === "rejected";

//   const handleConfirmReject = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!rejectReason.trim()) {
//       setValidationError("Please provide a rejection reason.");
//       return;
//     }
//     setValidationError(null);
//     await onReject(rejectReason.trim());
//     setModal(null);
//   };

//   const handleConfirmChanges = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!changesText.trim()) {
//       setValidationError("Please describe the requested changes.");
//       return;
//     }
//     setValidationError(null);
//     await onRequestChanges(changesText.trim());
//     setModal(null);
//   };

//   const handleConfirmApprove = async () => {
//     await onApprove();
//     setModal(null);
//   };

//   if (isFinalized) {
//     return (
//       <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs">
//         <p className="text-xs text-muted-foreground">
//           This application has been closed with status{" "}
//           <strong className="text-foreground uppercase">{application.status}</strong>. No further review
//           actions can be performed.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h3 className="text-sm font-semibold text-foreground font-heading">
//             Administrative Decisions
//           </h3>
//           <p className="text-xs text-muted-foreground mt-0.5">
//             Accept application credentials, require applicant corrections, or decline enrollment.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           {/* Request Changes */}
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             disabled={isProcessing}
//             onClick={() => {
//               setValidationError(null);
//               setModal("changes");
//             }}
//             className="h-9 px-3 border-border text-xs text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30 cursor-pointer"
//           >
//             <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
//             Request Changes
//           </Button>

//           {/* Reject */}
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             disabled={isProcessing}
//             onClick={() => {
//               setValidationError(null);
//               setModal("reject");
//             }}
//             className="h-9 px-3 border-border text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
//           >
//             <X className="h-3.5 w-3.5 mr-1.5" />
//             Reject
//           </Button>

//           {/* Approve */}
//           <Button
//             type="button"
//             size="sm"
//             disabled={isProcessing}
//             onClick={() => setModal("approve")}
//             className="h-9 px-4 bg-primary text-white text-xs hover:bg-primary/90 cursor-pointer"
//           >
//             <Check className="h-3.5 w-3.5 mr-1.5" />
//             Approve
//           </Button>
//         </div>
//       </div>

//       {/* Confirmation Modal: Approve */}
//       {modal === "approve" && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
//           <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
//             <div className="flex items-center gap-2.5 text-foreground font-semibold">
//               <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
//                 <Check className="h-4 w-4" />
//               </div>
//               <span>Approve Mechanic Application</span>
//             </div>
//             <p className="text-xs text-muted-foreground leading-relaxed">
//               Confirming approval will verify the mechanic's profile and enable roadside service
//               fulfillments.
//             </p>
//             <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 disabled={isProcessing}
//                 onClick={() => setModal(null)}
//                 className="h-9 text-xs border-border"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="button"
//                 size="sm"
//                 disabled={isProcessing}
//                 onClick={handleConfirmApprove}
//                 className="h-9 text-xs bg-primary text-white hover:bg-primary/90"
//               >
//                 {isProcessing ? (
//                   <>
//                     <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
//                     Approving...
//                   </>
//                 ) : (
//                   "Confirm Approval"
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal: Reject */}
//       {modal === "reject" && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
//           <form
//             onSubmit={handleConfirmReject}
//             className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4"
//           >
//             <div className="flex items-center gap-2.5 text-foreground font-semibold">
//               <div className="h-8 w-8 rounded-full bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center">
//                 <X className="h-4 w-4" />
//               </div>
//               <span>Reject Application</span>
//             </div>
//             <p className="text-xs text-muted-foreground">
//               Provide an official administrative reason for declining this applicant.
//             </p>
//             <div className="space-y-1.5">
//               <Label className="text-xs text-foreground">Rejection Reason *</Label>
//               <textarea
//                 rows={3}
//                 value={rejectReason}
//                 onChange={(e) => setRejectReason(e.target.value)}
//                 placeholder="State the reason for rejection..."
//                 className="w-full rounded-lg border border-border bg-input p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
//               />
//               {validationError && (
//                 <p className="text-[11px] text-destructive">{validationError}</p>
//               )}
//             </div>
//             <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 disabled={isProcessing}
//                 onClick={() => setModal(null)}
//                 className="h-9 text-xs border-border"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 size="sm"
//                 disabled={isProcessing}
//                 className="h-9 text-xs bg-destructive text-white hover:bg-destructive/90"
//               >
//                 {isProcessing ? (
//                   <>
//                     <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
//                     Rejecting...
//                   </>
//                 ) : (
//                   "Confirm Rejection"
//                 )}
//               </Button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Modal: Request Changes */}
//       {modal === "changes" && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
//           <form
//             onSubmit={handleConfirmChanges}
//             className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4"
//           >
//             <div className="flex items-center gap-2.5 text-foreground font-semibold">
//               <div className="h-8 w-8 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
//                 <AlertTriangle className="h-4 w-4" />
//               </div>
//               <span>Request Corrections</span>
//             </div>
//             <p className="text-xs text-muted-foreground">
//               Detail what the applicant needs to update or provide before approval can be granted.
//             </p>
//             <div className="space-y-1.5">
//               <Label className="text-xs text-foreground">Requested Corrections *</Label>
//               <textarea
//                 rows={3}
//                 value={changesText}
//                 onChange={(e) => setChangesText(e.target.value)}
//                 placeholder="Specify required corrections or missing documents..."
//                 className="w-full rounded-lg border border-border bg-input p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
//               />
//               {validationError && (
//                 <p className="text-[11px] text-destructive">{validationError}</p>
//               )}
//             </div>
//             <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 disabled={isProcessing}
//                 onClick={() => setModal(null)}
//                 className="h-9 text-xs border-border"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 size="sm"
//                 disabled={isProcessing}
//                 className="h-9 text-xs bg-orange-500 text-white hover:bg-orange-600"
//               >
//                 {isProcessing ? (
//                   <>
//                     <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
//                     Submitting...
//                   </>
//                 ) : (
//                   "Submit Request"
//                 )}
//               </Button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };