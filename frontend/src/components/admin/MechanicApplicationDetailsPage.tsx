// import React, { useEffect, useState, useCallback } from "react";
// import { useParams, Link } from "react-router-dom";
// import { ArrowLeft, Loader2, Calendar, Clock, UserCheck } from "lucide-react";
// import type { MechanicApplicationDTO } from "@/types/admin/mechanic";
// import {
//   getMechanicApplicationById,
//   approveMechanicApplication,
//   rejectMechanicApplication,
//   requestApplicationChanges,
// } from "@/services/admin/mechanicService";
// import { MechanicStatusBadge } from "@/components/admin/mechanic/MechanicStatusBadge";
// import { MechanicProfileDetails } from "@/components/admin/mechanic/MechanicProfileDetails";
// import { MechanicProfessionalDetails } from "@/components/admin/mechanic/MechanicProfessionalDetails";
// import { MechanicServiceLocation } from "@/components/admin/mechanic/MechanicServiceLocation";
// import { MechanicDocumentList } from "@/components/admin/mechanic/MechanicDocumentList";
// import { MechanicReviewActions } from "@/components/admin/mechanic/MechanicReviewActions";
// import { useToast } from "@/components/ui/toast/ToastProvider";
// import { Button } from "@/components/ui/button";

// export default function MechanicApplicationDetailsPage() {
//   const { applicationId } = useParams<{ applicationId: string }>();
//   const [application, setApplication] = useState<MechanicApplicationDTO | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const { showToast } = useToast();

//   const loadApplication = useCallback(async () => {
//     if (!applicationId) return;
//     try {
//       setIsLoading(true);
//       setError(null);
//       const data = await getMechanicApplicationById(applicationId);
//       if (!data) {
//         setError("Application not found");
//         return;
//       }
//       setApplication(data);
//     } catch (err: unknown) {
//       console.error("Failed to load application details:", err);
//       setError("Unable to retrieve mechanic application details from the server.");
//       showToast("Could not load application", "error");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [applicationId, showToast]);

//   useEffect(() => {
//     loadApplication();
//   }, [loadApplication]);

//   const handleApprove = async () => {
//     if (!applicationId) return;
//     try {
//       setIsProcessing(true);
//       const res = await approveMechanicApplication(applicationId);
//       showToast(res.message || "Application approved successfully", "success");
//       await loadApplication();
//     } catch (err: unknown) {
//       console.error("Approve error:", err);
//       showToast(
//         "Backend endpoint POST /admin/mechanic-applications/:id/approve is pending implementation.",
//         "error"
//       );
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleReject = async (reason: string) => {
//     if (!applicationId) return;
//     try {
//       setIsProcessing(true);
//       const res = await rejectMechanicApplication(applicationId, reason);
//       showToast(res.message || "Application rejected successfully", "success");
//       await loadApplication();
//     } catch (err: unknown) {
//       console.error("Reject error:", err);
//       showToast(
//         "Backend endpoint POST /admin/mechanic-applications/:id/reject is pending implementation.",
//         "error"
//       );
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleRequestChanges = async (instructions: string) => {
//     if (!applicationId) return;
//     try {
//       setIsProcessing(true);
//       const res = await requestApplicationChanges(applicationId, instructions);
//       showToast(res.message || "Change request transmitted", "success");
//       await loadApplication();
//     } catch (err: unknown) {
//       console.error("Request changes error:", err);
//       showToast(
//         "Backend endpoint POST /admin/mechanic-applications/:id/request-changes is pending implementation.",
//         "error"
//       );
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-24 space-y-3">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         <p className="text-xs font-medium text-muted-foreground">
//           Loading application records...
//         </p>
//       </div>
//     );
//   }

//   if (error || !application) {
//     return (
//       <div className="space-y-4">
//         <Link to="/admin/mechanics">
//           <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground">
//             <ArrowLeft className="h-3.5 w-3.5" />
//             Back to Mechanic Management
//           </Button>
//         </Link>
//         <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6">
//           <p className="text-sm font-semibold text-destructive">{error || "Application not found"}</p>
//         </div>
//       </div>
//     );
//   }

//   const applicantName =
//     typeof application.userId === "object" && application.userId?.fullName
//       ? application.userId.fullName
//       : "Mechanic Applicant";

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="space-y-1">
//           <Link to="/admin/mechanics">
//             <Button
//               variant="ghost"
//               size="sm"
//               className="h-8 px-0 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent -ml-1 gap-1.5"
//             >
//               <ArrowLeft className="h-3.5 w-3.5" />
//               Back to Mechanic Management
//             </Button>
//           </Link>

//           <div className="flex flex-wrap items-center gap-3 pt-1">
//             <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
//               {applicantName}
//             </h1>
//             <MechanicStatusBadge status={application.status} />
//           </div>

//           <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
//             <span className="font-mono">
//               App ID: {application.id || application._id || applicationId}
//             </span>
//             <span className="flex items-center gap-1 font-mono">
//               <Calendar className="h-3 w-3" />
//               Submitted:{" "}
//               {application.submittedAt
//                 ? new Date(application.submittedAt).toLocaleDateString()
//                 : "—"}
//             </span>
//             {application.reviewedAt && (
//               <span className="flex items-center gap-1 font-mono">
//                 <Clock className="h-3 w-3" />
//                 Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Review Actions */}
//       <MechanicReviewActions
//         application={application}
//         onApprove={handleApprove}
//         onReject={handleReject}
//         onRequestChanges={handleRequestChanges}
//         isProcessing={isProcessing}
//       />

//       {/* Audit History */}
//       {(application.reviewedBy || application.reviewReason) && (
//         <div className="bg-card border border-border/80 rounded-xl p-4 shadow-xs">
//           <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
//             <UserCheck className="h-3.5 w-3.5 text-primary" />
//             <span>Audit Trail</span>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
//             <div>
//               <span className="text-muted-foreground">Reviewed By:</span>
//               <p className="font-mono text-foreground font-medium">{application.reviewedBy || "—"}</p>
//             </div>
//             <div>
//               <span className="text-muted-foreground">Review Notes:</span>
//               <p className="text-foreground">{application.reviewReason || "—"}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Details Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
//         <div className="space-y-6">
//           <MechanicProfileDetails application={application} />
//           <MechanicServiceLocation application={application} />
//         </div>

//         <div className="space-y-6">
//           <MechanicProfessionalDetails application={application} />
//           <MechanicDocumentList documents={application.documents} />
//         </div>
//       </div>
//     </div>
//   );
// }