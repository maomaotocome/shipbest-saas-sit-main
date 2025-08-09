"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Chat {
  url: string;
  title: string;
}

export default function HistoryPage() {
  const t = useTranslations("playground.history");
  const [chat, setChat] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await fetch("/api/playground/chat");
        const data = await response.json();
        setChat(data);
      } catch (error) {
        console.error("Error fetching chat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, []);

  const filteredChat = chat.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">{t("loading")}</div>
      ) : (
        <div className="space-y-4">
          {filteredChat.map((chat, index) => (
            <Link key={index} href={chat.url}>
              <Card className="cursor-pointer p-4 transition-colors hover:bg-gray-50">
                <h2 className="text-lg font-medium">{chat.title}</h2>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
