import { HealthCategoryModel, HealthtipsModel } from "@/app/model/healthtips_model";
import { db } from "@/firebase/clientApp";
import { collection, getDocs, getDoc, doc, orderBy, query, updateDoc } from "firebase/firestore";

// ✅ Get all health tips
export const getHealtips = async (): Promise<HealthtipsModel[]> => {
  const healthtips: HealthtipsModel[] = [];
  const q = query(collection(db, "HealthTips"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((d) => {
    const data = d.data();
    healthtips.push({
      id: d.id, // ✅ Use Firestore document ID
      title: data.title || "",
      description: data.description || "",
      categoryId: data.categoryId || "",
      image: data.image || "",
      type: data.type || "",
      views: data.views || 0,
      createdAt: data.createdAt,
    });
  });

  return healthtips;
};

// ✅ Get all health categories
export const getHealthCategory = async (): Promise<HealthCategoryModel[]> => {
  const categories: HealthCategoryModel[] = [];
  const q = query(collection(db, "HealthTipsCategory"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((d) => {
    const data = d.data();
    categories.push({
      id: d.id, // ✅ Use Firestore document ID
      name: data.name || "",
      image: data.image || "",
    });
  });

  return categories;
};

// ✅ Get single health tip by ID
export const getHealthtipById = async (id: string): Promise<HealthtipsModel | null> => {
  try {
    const docRef = doc(db, "HealthTips", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title || "",
      description: data.description || "",
      categoryId: data.categoryId || "",
      image: data.image || "",
      type: data.type || "",
      views: data.views || 0,
      createdAt: data.createdAt,
    };
  } catch (error) {
    console.error("Error getting health tip:", error);
    throw new Error("Failed to get health tip");
  }
};

// ✅ Update a health tip by ID
export const updateHealthtip = async (id: string, data: Partial<HealthtipsModel>) => {
  try {
    const docRef = doc(db, "HealthTips", id);
    await updateDoc(docRef, data);
    return { success: true, message: "Health tip updated successfully" };
  } catch (error) {
    console.error("Error updating health tip:", error);
    throw new Error("Failed to update health tip");
  }
};
