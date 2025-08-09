"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { OssProvider } from "@/db/generated/prisma";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useBucket, useBucketMutation } from "./hooks";

interface BucketModalProps {
  open: boolean;
  onClose: () => void;
  bucketId?: string | null;
}

interface FormData {
  name: string;
  provider: OssProvider;
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

export default function BucketModal({ open, onClose, bucketId }: BucketModalProps) {
  const t = useTranslations("admin.oss.buckets");
  const { data: bucket } = useBucket(bucketId ?? null);
  const mutation = useBucketMutation(bucketId, onClose);

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    defaultValues: {
      isPublic: false,
      allowedTypes: [],
      provider: OssProvider.S3,
    },
  });

  useEffect(() => {
    if (bucket) {
      reset({
        name: bucket.name,
        provider: bucket.provider,
        region: bucket.region || "",
        bucket: bucket.bucket,
        endpoint: bucket.endpoint || "",
        publicUrl: bucket.publicUrl || "",
        isPublic: bucket.isPublic,
        accessKey: bucket.accessKey || "",
        secretKey: bucket.secretKey || "",
        maxSize: bucket.maxSize || undefined,
        allowedTypes: bucket.allowedTypes,
        pathPrefix: bucket.pathPrefix || "",
      });
    }
  }, [bucket, reset]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{bucketId ? t("editBucket") : t("createBucket")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>
            <div>
              <Label>{t("provider")}</Label>
              <Select
                value={watch("provider")}
                onValueChange={(value) => setValue("provider", value as OssProvider)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("provider")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OssProvider).map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bucket">{t("bucketName")}</Label>
              <Input id="bucket" {...register("bucket", { required: true })} />
            </div>
            <div>
              <Label htmlFor="region">{t("region")}</Label>
              <Input id="region" {...register("region")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endpoint">{t("endpoint")}</Label>
              <Input id="endpoint" {...register("endpoint")} />
            </div>
            {watch("isPublic") && (
              <div>
                <Label htmlFor="publicUrl">{t("publicUrl")}</Label>
                <Input id="publicUrl" {...register("publicUrl")} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accessKey">{t("accessKey")}</Label>
              <Input id="accessKey" type="password" {...register("accessKey")} />
            </div>
            <div>
              <Label htmlFor="secretKey">{t("secretKey")}</Label>
              <Input id="secretKey" type="password" {...register("secretKey")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxSize">{t("maxSize")}</Label>
              <Input id="maxSize" type="number" {...register("maxSize", { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="pathPrefix">{t("pathPrefix")}</Label>
              <Input id="pathPrefix" {...register("pathPrefix")} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={watch("isPublic")}
              onCheckedChange={(checked) => setValue("isPublic", checked)}
            />
            <Label>{t("publicAccess")}</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {bucketId ? t("update") : t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
