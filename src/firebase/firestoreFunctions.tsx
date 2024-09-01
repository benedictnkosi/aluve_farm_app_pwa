import "firebase/firestore";
import {
  QueryDocumentSnapshot,
  DocumentData,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDoc,
  DocumentReference,
  getFirestore,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./config";

interface Sale {
  id: string;
  customer: DocumentReference<DocumentData>;
  crop: DocumentReference<DocumentData>;
  date: string;
  price: number;
  quantity: number;
  customer_name: string;
  crop_name: string;
  payment: string;
  payment_method: string;
  // other fields...
}

interface SaleWithDetails {
  id: string;
  customerName: string;
  cropName: string;
  date: string;
  price: number;
  quantity: number;
  payment: string;
  payment_method: string;
  // other fields...
}

interface Item {
  id: string;
  [key: string]: unknown;
}

export async function readDataFromFirestoreByValue(
  collectionName: string,
  fieldName: string,
  value: string
): Promise<Item[] | undefined> {
  try {
    let q = query(
      collection(db, collectionName),
      where(fieldName, "==", value.toString())
    );

    if (value === "true") {
      q = query(collection(db, collectionName), where(fieldName, "==", true));
    } else if (value === "false") {
      q = query(collection(db, collectionName), where(fieldName, "==", false));
    }

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];

      return items;
    } else {
      throw new Error(
        `No documents found in ${collectionName} for the provided ${fieldName} and value ${value}`
      );
    }
  } catch {
    console.error("Error reading data from Firestore:", error);
    throw new Error("Error reading data from Firestore:");
  }
  return [] as Item[]; // Add a return statement for the case when querySnapshot is empty
}

export async function getByRefAndValue(
  collectionName: string,
  refColumn: string,
  refDocument: DocumentReference<unknown, DocumentData>
): Promise<Item[]> {
  try {
    const q = query(
      collection(db, collectionName),
      where(refColumn, "==", refDocument)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];

      return items;
    } else {
      throw new Error(
        `No ${refColumn} documents found for the provided farmRef ${refDocument.id}`
      );
    }
  } catch {
    console.error("Error reading data from Firestore:", error);
    throw new Error(`No documents found for the provided farmRef`);
  }
  return [] as Item[]; // Add a return statement for the case when querySnapshot is empty
}

export async function getDocFromFirestoreByValue(
  collectionName: string,
  docId: string
): Promise<DocumentReference<unknown, DocumentData>> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(
        `No document found in ${collectionName} for the provided docId ${docId}`
      );
    } else {
      console.log("Document ID:", docRef.id);
    }
    return docRef;
  } catch {
    console.error("Error reading data from Firestore:", error);
    throw new Error(
      `No document found in ${collectionName} for the provided docId ${docId}`
    );
  }
}

export async function getVisibleFarmsWithCrop(
  crop: string
): Promise<Item[] | undefined> {
  try {
    const q = query(
      collection(db, "farm"),
      where("visible", "==", true),
      where("crops", "!=", null)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];

      if (crop == "Filter By Crop") {
        return items;
      } else {
        const filteredItems = items.filter((item) =>
          (item.crops as string[]).includes(crop)
        );
        return filteredItems;
      }
    }
    return [] as Item[]; // Add a return statement for the case when querySnapshot is empty
  } catch {
    console.error("Error reading data from Firestore:", error);
  }
}

export async function readDataFromFirestore(
  collectionName: string
): Promise<Item[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const docSnapshot = querySnapshot.docs[0];
    if (docSnapshot) {
      const items = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];
      return items;
    } else {
      throw new Error("Document does not exist");
    }
  } catch {
    console.error("Error reading data from Firestore:", error);
    throw new Error("Document does not exist");
  }
}

export async function createDocument(
  collectionName: string,
  data: DocumentData
) {
  try {
    const userCollection = collection(db, collectionName);
    return await addDoc(userCollection, data);
  } catch {
    console.error("Error creating document on Firestore:", error);
  }
}

export async function updateRecord(
  collectionName: string,
  data: DocumentData,
  docId: string
) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  } catch {
    console.error("Error updating document on Firestore:", error);
  }
}

/**
 * Updates a document in Firestore by a specific field.
 * @param collectionName - The name of the collection where the document is located.
 * @param data - The data to update the document with.
 * @param fieldName - The name of the field to match.
 * @param fieldId - The value of the field to match.
 * @returns {Promise<void>} - A promise that resolves when the document is successfully updated.
 * @throws {Error} - If there is an error updating the document.
 */
export async function updateRecordByField(
  collectionName: string,
  data: DocumentData,
  fieldName: string,
  fieldValue: string
): Promise<void> {
  try {
    // Get the document reference for the collection where fieldName = fieldId
    const querySnapshot = await getDocs(collection(db, collectionName));
    const docRef = querySnapshot.docs.find(
      (doc) => doc.data()[fieldName] === fieldValue
    );

    if (!docRef) {
      throw new Error(
        `Document not found in collection ${collectionName} where ${fieldName} = ${fieldValue}`
      );
    }

    await updateDoc(docRef.ref, data);
  } catch {
    console.error("Error updating document on Firestore:", error);
  }
}

export async function assignFarmToUser(
  userid: string,
  farmRef: DocumentReference<unknown, DocumentData>
): Promise<void> {
  try {
    const querySnapshot = await getDocs(collection(db, "user"));
    const userDocRef = querySnapshot.docs.find(
      (doc) => doc.data()["userid"] === userid
    );

    if (!userDocRef) {
      throw new Error(`User document not found for user id ${userid}`);
    }

    const userFarmData = {
      farm: farmRef,
    };
    await updateDoc(userDocRef.ref, userFarmData);
  } catch {
    console.error("Error assigning farm to user:", error);
  }
}

export async function getDocument(docId: string) {
  const db = getFirestore();
  const temDocRef = doc(db, "customer/" + docId);
  const docSnap = await getDoc(temDocRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document! " + temDocRef.id);
    return null;
  }
}

/**
 * Retrieves all sales with the customer name, crop name, and date.
 * @returns {Promise<SaleWithDetails[]>} - A promise that resolves to an array of sales with details.
 * @throws {Error} - If there is an error retrieving the sales or referenced documents.
 */
export async function getSalesWithDetails(): Promise<SaleWithDetails[]> {
  const db = getFirestore();
  const salesCollection = collection(db, "sales");

  try {
    const salesQuery = query(salesCollection, orderBy("date", "desc"), limit(100));
    const salesSnapshot = await getDocs(salesQuery);
    const salesWithDetails: SaleWithDetails[] = [];

    for (const saleDoc of salesSnapshot.docs) {
      const saleData = saleDoc.data() as Sale;

      // Combine data
      salesWithDetails.push({
        id: saleDoc.id,
        customerName: saleData.customer_name,
        cropName: saleData.crop_name,
        date: saleData.date,
        price: saleData.price,
        quantity: saleData.quantity,
        payment: saleData.payment,
        payment_method: saleData.payment_method,
        // other fields...
      });
    }

    return salesWithDetails;
  } catch {
    console.error("Error retrieving sales with details:", error);
    throw error;
  }
}
