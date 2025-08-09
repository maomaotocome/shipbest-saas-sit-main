export async function getImageUrlsFromFileItems(
  value: unknown,
  userId: string,
  getViewInfo: (params: { userId: string; objectId: string }) => Promise<{ url: string }>
): Promise<string[]> {
  if (!value || !Array.isArray(value)) return [];
  return Promise.all(
    value.map(async (item) => {
      if (typeof item === "string") {
        return item;
      }
      if (item.isPublic && item.url) {
        return item.url;
      }
      if (item.objectId) {
        const info = await getViewInfo({ userId, objectId: item.objectId });
        return info.url;
      }
      throw new Error("Invalid file item: missing url or objectId");
    })
  );
}
