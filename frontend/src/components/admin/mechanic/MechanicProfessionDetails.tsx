// import React from "react";
// import { User, Mail, Phone, Hash } from "lucide-react";
// import type { MechanicApplicationDTO } from "@/types/admin/mechanic";

// export const MechanicProfileDetails: React.FC<{ application: MechanicApplicationDTO }> = ({
//   application,
// }) => {
//   const resolveUserId = (userId: MechanicApplicationDTO["userId"]): string => {
//     if (typeof userId === "string") return userId;
//     return userId?._id || "—";
//   };

//   const name =
//     typeof application.userId === "object" && application.userId?.fullName
//       ? application.userId.fullName
//       : `Mechanic Applicant (${resolveUserId(application.userId).slice(-6)})`;

//   const email =
//     typeof application.userId === "object" && application.userId?.email
//       ? application.userId.email
//       : "—";

//   const phone =
//     typeof application.userId === "object" && application.userId?.phoneNumber
//       ? application.userId.phoneNumber
//       : "—";

//   const initials = name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   return (
//     <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs">
//       <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//         <User className="h-4 w-4 text-primary" />
//         <span>Personal & Account Details</span>
//       </div>

//       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 mb-4 border-b border-border/60">
//         {application.profilePhotoKey ? (
//           <img
//             src={application.profilePhotoKey}
//             alt={name}
//             className="h-14 w-14 rounded-full object-cover border-2 border-border shadow-xs"
//           />
//         ) : (
//           <div className="h-14 w-14 rounded-full bg-secondary border-2 border-border flex items-center justify-center font-bold text-sm text-foreground shadow-xs">
//             {initials}
//           </div>
//         )}
//         <div>
//           <h2 className="text-base font-semibold text-foreground font-heading">{name}</h2>
//           <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mt-0.5">
//             <Hash className="h-3 w-3" />
//             <span>User ID: {resolveUserId(application.userId)}</span>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
//         <div className="space-y-1">
//           <span className="text-muted-foreground flex items-center gap-1.5">
//             <Mail className="h-3.5 w-3.5" />
//             Email Address
//           </span>
//           <p className="font-mono text-foreground font-medium">{email}</p>
//         </div>

//         <div className="space-y-1">
//           <span className="text-muted-foreground flex items-center gap-1.5">
//             <Phone className="h-3.5 w-3.5" />
//             Phone Number
//           </span>
//           <p className="font-mono text-foreground font-medium">{phone}</p>
//         </div>
//       </div>
//     </div>
//   );
// };