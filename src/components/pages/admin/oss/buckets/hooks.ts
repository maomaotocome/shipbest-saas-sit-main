import { createBucket, getBuckets } from "@/actions/admin/oss/buckets/buckets";
import { getBucket, updateBucket } from "@/actions/admin/oss/buckets/item";
import { OssProvider } from "@/db/generated/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface BucketFormData {
  name: string;
  provider: string;
  region?: string;
  bucket: string;
  endpoint?: string;
  publicUrl?: string;
  isPublic: boolean;
  accessKey?: string;
  secretKey?: string;
  maxSize?: number;
  allowedTypes: string[];
  pathPrefix?: string;
}

async function fetchBuckets() {
  return getBuckets();
}

async function fetchBucket(bucketId: string) {
  const bucket = await getBucket(bucketId);
  if (!bucket) {
    throw new Error("Bucket not found");
  }
  return bucket;
}

async function saveBucket(data: BucketFormData, bucketId?: string | null) {
  if (bucketId) {
    return updateBucket({
      where: { id: bucketId },
      data: {
        provider: data.provider as OssProvider,
        region: data.region,
        bucket: data.bucket,
        endpoint: data.endpoint,
        publicUrl: data.publicUrl,
        isPublic: data.isPublic,
        accessKey: data.accessKey,
        secretKey: data.secretKey,
        maxSize: data.maxSize,
        allowedTypes: data.allowedTypes,
        pathPrefix: data.pathPrefix,
      },
    });
  }
  return createBucket({
    data: {
      name: data.name,
      provider: data.provider as OssProvider,
      region: data.region,
      bucket: data.bucket,
      endpoint: data.endpoint,
      publicUrl: data.publicUrl,
      isPublic: data.isPublic,
      accessKey: data.accessKey,
      secretKey: data.secretKey,
      maxSize: data.maxSize,
      allowedTypes: data.allowedTypes,
      pathPrefix: data.pathPrefix,
    },
  });
}

export function useBuckets() {
  return useQuery({
    queryKey: ["oss-buckets"],
    queryFn: fetchBuckets,
  });
}

export function useBucket(bucketId: string | null) {
  return useQuery({
    queryKey: ["oss-bucket", bucketId],
    queryFn: () => fetchBucket(bucketId!),
    enabled: !!bucketId,
  });
}

export function useBucketMutation(bucketId?: string | null, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BucketFormData) => saveBucket(data, bucketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oss-buckets"] });
      queryClient.invalidateQueries({ queryKey: ["oss-bucket", bucketId] });
      onSuccess?.();
    },
  });
}
