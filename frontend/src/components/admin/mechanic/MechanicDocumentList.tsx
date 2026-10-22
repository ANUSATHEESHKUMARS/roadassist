
// import React from "react";
// import {
//   FileText,
//   ExternalLink,
//   FileCheck,
//   AlertCircle,
//   FileX,
// } from "lucide-react";

// import type {
//   MechanicDocumentType,
//   MechanicDocumentStatus,
// } from "@/types/mechanic/common";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";

// interface MechanicDocumentListProps {
//   documents?: MechanicDocument[];
// }

// export const MechanicDocumentList: React.FC<
//   MechanicDocumentListProps
// > = ({ documents = [] }) => {
//   const getDocStatusBadge = (status: MechanicDocumentStatus) => {
//     switch (status) {
//       case "verified":
//         return (
//           <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
//             <FileCheck className="h-3.5 w-3.5" />
//             Verified
//           </span>
//         );

//       case "rejected":
//         return (
//           <span className="inline-flex items-center gap-1 text-xs text-destructive">
//             <FileX className="h-3.5 w-3.5" />
//             Rejected
//           </span>
//         );

//       default:
//         return (
//           <span className="inline-flex items-center gap-1 text-xs text-amber-400">
//             <AlertCircle className="h-3.5 w-3.5" />
//             Pending
//           </span>
//         );
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2 text-sm">
//           <FileText className="h-4 w-4 text-primary" />
//           Submitted Documents
//         </CardTitle>
//       </CardHeader>

//       <CardContent>
//         {documents.length === 0 ? (
//           <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
//             No documents were submitted for this application.
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//             {documents.map((doc) => (
//               <div
//                 key={`${doc.documentType}-${doc.fileKey}`}
//                 className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3"
//               >
//                 <div className="flex min-w-0 items-start gap-3">
//                   <FileText className="mt-1 h-5 w-5 shrink-0 text-primary" />

//                   <div className="min-w-0">
//                     <p className="text-sm font-medium text-foreground">
//                       {doc.documentType}
//                     </p>

//                     <p className="truncate text-xs text-muted-foreground">
//                       {doc.originalName}
//                     </p>

//                     <div className="mt-2">
//                       {getDocStatusBadge(doc.verificationStatus)}
//                     </div>

//                     {doc.rejectionReason && (
//                       <p className="mt-1 text-xs text-destructive">
//                         Reason: {doc.rejectionReason}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {doc.fileUrl && (
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="icon"
//                     className="h-8 w-8 shrink-0"
//                     title="Inspect document"
//                     onClick={() =>
//                       window.open(
//                         doc.fileUrl,
//                         "_blank",
//                         "noopener,noreferrer"
//                       )
//                     }
//                   >
//                     <ExternalLink className="h-4 w-4" />
//                   </Button>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };
