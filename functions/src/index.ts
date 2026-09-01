import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// 1. Audit Log Automatic Capture Trigger
export const auditFirestoreWrite = functions.firestore
  .document("{collectionId}/{docId}")
  .onWrite(async (change, context) => {
    const { collectionId, docId } = context.params;
    if (collectionId === "audit_logs") return; // Avoid infinite loops

    const action = !change.before.exists
      ? "CREATE"
      : !change.after.exists
      ? "DELETE"
      : "UPDATE";

    const dataBefore = change.before.exists ? change.before.data() : null;
    const dataAfter = change.after.exists ? change.after.data() : null;
    const actorId = dataAfter?.updatedBy || dataAfter?.createdBy || "system";
    const actorRole = dataAfter?.actorRole || "System";

    await db.collection("audit_logs").add({
      targetCollection: collectionId,
      targetDocId: docId,
      action,
      actorId,
      actorRole,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      diff: {
        before: dataBefore,
        after: dataAfter,
      },
      ipAddress: "cloud-function-hook",
      verificationHash: `hash-${Date.now()}-${docId}`,
    });
  });

// 2. Set Custom User Claims for strict Role-Based Access Control
export const setUserRoleClaim = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required");
  }

  const caller = await admin.auth().getUser(context.auth.uid);
  if (caller.customClaims?.role !== "National Admin") {
    throw new functions.https.HttpsError("permission-denied", "Only National Admins can assign roles");
  }

  const { targetUid, role, stateId, districtId } = data;
  await admin.auth().setCustomUserClaims(targetUid, { role, stateId, districtId });
  await db.collection("users").doc(targetUid).update({
    role,
    stateId: stateId || null,
    districtId: districtId || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: `Role ${role} successfully assigned to ${targetUid}` };
});
