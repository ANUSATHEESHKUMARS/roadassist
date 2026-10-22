// import React from "react";
// import { MapPin, Building2, Compass } from "lucide-react";
// import type { MechanicApplicationDTO } from "@/types/admin/mechanic";

// export const MechanicServiceLocation: React.FC<{ application: MechanicApplicationDTO }> = ({
//   application,
// }) => {
//   const isWorkshopRelevant =
//     application.serviceModel === "workshop" || application.serviceModel === "both";

//   return (
//     <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs">
//       <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//         <MapPin className="h-4 w-4 text-primary" />
//         <span>Service Coverage & Workshop</span>
//       </div>

//       <div className="space-y-4 text-xs">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-1">
//             <span className="text-muted-foreground">Service Address</span>
//             <p className="text-foreground font-medium">{application.serviceAddress || "—"}</p>
//           </div>

//           <div className="space-y-1">
//             <span className="text-muted-foreground">Postal Code / Pincode</span>
//             <p className="text-foreground font-mono font-medium">{application.pincode || "—"}</p>
//           </div>
//         </div>

//         {(application.latitude !== undefined || application.longitude !== undefined) && (
//           <div className="flex items-center gap-2 text-muted-foreground bg-input/30 border border-border/50 rounded-lg p-2.5">
//             <Compass className="h-4 w-4 text-primary shrink-0" />
//             <span className="font-mono text-[11px]">
//               GPS Coordinates: {application.latitude ?? "—"}, {application.longitude ?? "—"}
//             </span>
//           </div>
//         )}

//         {isWorkshopRelevant && (
//           <div className="pt-3 border-t border-border/60 space-y-3">
//             <div className="flex items-center gap-1.5 text-foreground font-semibold">
//               <Building2 className="h-4 w-4 text-primary" />
//               <span>Workshop Details</span>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <span className="text-muted-foreground">Workshop Name</span>
//                 <p className="text-foreground font-medium">{application.workshopName || "—"}</p>
//               </div>

//               <div className="space-y-1">
//                 <span className="text-muted-foreground">Workshop Address</span>
//                 <p className="text-foreground font-medium">{application.workshopAddress || "—"}</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };