const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Vui long chon tep hinh anh hop le.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "Kich thuoc anh khong duoc lon hon 2MB.";
  }
  return null;
}

export async function uploadImageFile(file: File, folder = "images"): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("folder", folder);
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error?: unknown }).error)
        : "Khong the upload anh len server.";
    throw new Error(message);
  }

  if (!payload || typeof payload !== "object" || !("url" in payload)) {
    throw new Error("Server upload khong tra ve URL anh.");
  }

  return String((payload as { url: unknown }).url);
}
