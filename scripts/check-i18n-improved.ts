#!/usr/bin/env tsx

import fs from "fs";
import path from "path";

interface I18nIssues {
  missingFiles: string[];
  missingKeys: Record<string, string[]>;
  sameAsEnglish: Record<string, string[]>;
  extraKeys: Record<string, string[]>;
}

interface TranslationData {
  [key: string]: any;
}

class I18nChecker {
  private messagesDir: string;
  private languages: string[];
  private issues: I18nIssues;

  // whitelist
  private whitelist: string[] = [
    // placeholder
    "blog.metadata.post.title",
    "blog.metadata.post.description",
    "blog.metadata.post.keywords",
    "uploader.fileLibrary.fileSize",

    // brand name
    "home.hero.title",
    "footer.links.videoModels.klingAi",
    "footer.links.videoModels.runway",
    "footer.links.videoModels.viduAi",
    "footer.links.videoModels.lumaAi",
    "footer.links.videoModels.pixverseAi",

    // special value
    "credit.unavailable",
  ];

  constructor() {
    this.messagesDir = path.join(process.cwd(), "src/i18n/messages");
    this.languages = ["en", "zh", "zh-HK", "de", "es", "fr", "it", "ja", "ko", "pt"];
    this.issues = {
      missingFiles: [],
      missingKeys: {},
      sameAsEnglish: {},
      extraKeys: {},
    };
  }

  async run() {
    console.log("🔍 Start checking i18n files...\n");

    // 1. check missing files
    await this.checkMissingFiles();

    // 2. check missing keys
    await this.checkMissingKeys();

    // 3. check same as english (exclude whitelist)
    await this.checkSameAsEnglish();

    // 4. check extra keys
    await this.checkExtraKeys();

    // 5. print report
    this.printReport();

    // 6. print fix suggestions
    this.printFixSuggestions();
  }

  private async checkMissingFiles() {
    console.log("📁 Check missing files...");

    const enFiles = await this.getFilesForLanguage("en");

    for (const lang of this.languages) {
      if (lang === "en") continue;

      const langFiles = await this.getFilesForLanguage(lang);
      const missing = enFiles.filter((file) => !langFiles.includes(file));

      if (missing.length > 0) {
        this.issues.missingFiles.push(...missing.map((file) => `${lang}/${file}`));
        console.log(`  ❌ ${lang}: 缺失 ${missing.length} 个文件`);
        missing.forEach((file) => console.log(`    - ${file}`));
      } else {
        console.log(`  ✅ ${lang}: 文件完整`);
      }
    }
    console.log("");
  }

  private async checkMissingKeys() {
    console.log("🔑 Check missing keys...");

    const enFiles = await this.getFilesForLanguage("en");

    for (const lang of this.languages) {
      if (lang === "en") continue;

      this.issues.missingKeys[lang] = [];

      for (const file of enFiles) {
        const enPath = path.join(this.messagesDir, "en", file);
        const langPath = path.join(this.messagesDir, lang, file);

        if (!fs.existsSync(langPath)) continue;

        const enData = this.loadJsonFile(enPath);
        const langData = this.loadJsonFile(langPath);

        const missingKeys = this.findMissingKeys(enData, langData);
        if (missingKeys.length > 0) {
          this.issues.missingKeys[lang].push(...missingKeys.map((key) => `${file}:${key}`));
        }
      }

      if (this.issues.missingKeys[lang].length > 0) {
        console.log(`  ❌ ${lang}: missing ${this.issues.missingKeys[lang].length} keys`);
        this.issues.missingKeys[lang].slice(0, 5).forEach((key) => console.log(`    - ${key}`));
        if (this.issues.missingKeys[lang].length > 5) {
          console.log(`    ... and ${this.issues.missingKeys[lang].length - 5} more`);
        }
      } else {
        console.log(`  ✅ ${lang}: keys are complete`);
      }
    }
    console.log("");
  }

  private async checkSameAsEnglish() {
    console.log("🔄 Check same as english (exclude whitelist)...");

    const enFiles = await this.getFilesForLanguage("en");

    for (const lang of this.languages) {
      if (lang === "en") continue;

      this.issues.sameAsEnglish[lang] = [];

      for (const file of enFiles) {
        const enPath = path.join(this.messagesDir, "en", file);
        const langPath = path.join(this.messagesDir, lang, file);

        if (!fs.existsSync(langPath)) continue;

        const enData = this.loadJsonFile(enPath);
        const langData = this.loadJsonFile(langPath);

        const sameKeys = this.findSameAsEnglish(enData, langData);
        if (sameKeys.length > 0) {
          this.issues.sameAsEnglish[lang].push(...sameKeys.map((key) => `${file}:${key}`));
        }
      }

      if (this.issues.sameAsEnglish[lang].length > 0) {
        console.log(
          `  ⚠️  ${lang}: ${this.issues.sameAsEnglish[lang].length} keys are the same as english`
        );
        this.issues.sameAsEnglish[lang].slice(0, 5).forEach((key) => console.log(`    - ${key}`));
        if (this.issues.sameAsEnglish[lang].length > 5) {
          console.log(`    ... and ${this.issues.sameAsEnglish[lang].length - 5} more`);
        }
      } else {
        console.log(`  ✅ ${lang}: translation is normal`);
      }
    }
    console.log("");
  }

  private async checkExtraKeys() {
    console.log("➕ Check extra keys...");

    const enFiles = await this.getFilesForLanguage("en");

    for (const lang of this.languages) {
      if (lang === "en") continue;

      this.issues.extraKeys[lang] = [];

      for (const file of enFiles) {
        const enPath = path.join(this.messagesDir, "en", file);
        const langPath = path.join(this.messagesDir, lang, file);

        if (!fs.existsSync(langPath)) continue;

        const enData = this.loadJsonFile(enPath);
        const langData = this.loadJsonFile(langPath);

        const extraKeys = this.findExtraKeys(enData, langData);
        if (extraKeys.length > 0) {
          this.issues.extraKeys[lang].push(...extraKeys.map((key) => `${file}:${key}`));
        }
      }

      if (this.issues.extraKeys[lang].length > 0) {
        console.log(`  ⚠️  ${lang}: ${this.issues.extraKeys[lang].length} extra keys`);
        this.issues.extraKeys[lang].slice(0, 5).forEach((key) => console.log(`    - ${key}`));
        if (this.issues.extraKeys[lang].length > 5) {
          console.log(`    ... and ${this.issues.extraKeys[lang].length - 5} more`);
        }
      } else {
        console.log(`  ✅ ${lang}: no extra keys`);
      }
    }
    console.log("");
  }

  private async getFilesForLanguage(lang: string): Promise<string[]> {
    const langDir = path.join(this.messagesDir, lang);
    if (!fs.existsSync(langDir)) return [];

    return this.findJsonFiles(langDir);
  }

  private findJsonFiles(dir: string, relativePath = ""): string[] {
    const files: string[] = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          const subPath = relativePath ? path.join(relativePath, item) : item;
          files.push(...this.findJsonFiles(fullPath, subPath));
        } else if (item.endsWith(".json")) {
          const filePath = relativePath ? path.join(relativePath, item) : item;
          files.push(filePath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  cannot read directory: ${dir}`);
    }

    return files.sort();
  }

  private loadJsonFile(filePath: string): TranslationData {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.warn(`⚠️  cannot read file: ${filePath}`);
      return {};
    }
  }

  private findMissingKeys(
    enData: TranslationData,
    langData: TranslationData,
    prefix = ""
  ): string[] {
    const missing: string[] = [];

    for (const key in enData) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (!(key in langData)) {
        missing.push(fullKey);
      } else if (typeof enData[key] === "object" && enData[key] !== null) {
        missing.push(...this.findMissingKeys(enData[key], langData[key], fullKey));
      }
    }

    return missing;
  }

  private findSameAsEnglish(
    enData: TranslationData,
    langData: TranslationData,
    prefix = ""
  ): string[] {
    const same: string[] = [];

    for (const key in enData) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (key in langData) {
        if (typeof enData[key] === "string" && typeof langData[key] === "string") {
          if (enData[key] === langData[key] && !this.isWhitelisted(fullKey)) {
            same.push(fullKey);
          }
        } else if (typeof enData[key] === "object" && enData[key] !== null) {
          same.push(...this.findSameAsEnglish(enData[key], langData[key], fullKey));
        }
      }
    }

    return same;
  }

  private isWhitelisted(key: string): boolean {
    return this.whitelist.includes(key);
  }

  private findExtraKeys(enData: TranslationData, langData: TranslationData, prefix = ""): string[] {
    const extra: string[] = [];

    for (const key in langData) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (!(key in enData)) {
        extra.push(fullKey);
      } else if (
        typeof langData[key] === "object" &&
        langData[key] !== null &&
        typeof enData[key] === "object" &&
        enData[key] !== null
      ) {
        extra.push(...this.findExtraKeys(enData[key], langData[key], fullKey));
      }
    }

    return extra;
  }

  private printReport() {
    console.log("📊 Check report");
    console.log("=".repeat(50));

    const totalMissingFiles = this.issues.missingFiles.length;
    const totalMissingKeys = Object.values(this.issues.missingKeys).flat().length;
    const totalSameAsEnglish = Object.values(this.issues.sameAsEnglish).flat().length;
    const totalExtraKeys = Object.values(this.issues.extraKeys).flat().length;

    console.log(`📁 Missing files: ${totalMissingFiles}`);
    console.log(`🔑 Missing keys: ${totalMissingKeys}`);
    console.log(`🔄 Same as english: ${totalSameAsEnglish}`);
    console.log(`➕ Extra keys: ${totalExtraKeys}`);

    const totalIssues = totalMissingFiles + totalMissingKeys + totalSameAsEnglish + totalExtraKeys;
    console.log(`\nTotal issues: ${totalIssues}`);

    if (totalIssues === 0) {
      console.log("🎉 All i18n files are complete and consistent!");
    }
    console.log("");
  }

  private printFixSuggestions() {
    if (
      Object.values(this.issues).every((issue) =>
        Array.isArray(issue)
          ? issue.length === 0
          : Object.values(issue as Record<string, string[]>).every(
              (arr: string[]) => arr.length === 0
            )
      )
    ) {
      return;
    }

    console.log("🔧 Fix suggestions");
    console.log("=".repeat(50));

    if (this.issues.missingFiles.length > 0) {
      console.log("\n1. Create missing files:");
      this.issues.missingFiles.forEach((file) => {
        console.log(
          `   - Copy src/i18n/messages/en/${file.replace(/^[^\/]+\//, "")} to src/i18n/messages/${file}`
        );
      });
    }

    if (Object.values(this.issues.missingKeys).some((keys) => keys.length > 0)) {
      console.log("\n2. Add missing keys:");
      for (const [lang, keys] of Object.entries(this.issues.missingKeys)) {
        if (keys.length > 0) {
          console.log(`   - ${lang}: need to add ${keys.length} keys`);
        }
      }
    }

    if (Object.values(this.issues.sameAsEnglish).some((keys) => keys.length > 0)) {
      console.log("\n3. Translate keys that are the same as english:");
      for (const [lang, keys] of Object.entries(this.issues.sameAsEnglish)) {
        if (keys.length > 0) {
          console.log(`   - ${lang}: need to translate ${keys.length} keys`);
        }
      }

      // add translation suggestions grouped by file
      this.printFileBasedTranslationSuggestions();
    }

    if (Object.values(this.issues.extraKeys).some((keys) => keys.length > 0)) {
      console.log("\n4. Clean up extra keys:");
      for (const [lang, keys] of Object.entries(this.issues.extraKeys)) {
        if (keys.length > 0) {
          console.log(`   - ${lang}: need to clean up ${keys.length} extra keys`);
        }
      }
    }

    console.log("\n💡 Tip: Please translate by file!");
  }

  private printFileBasedTranslationSuggestions() {
    console.log("\n📋 Translation suggestions grouped by file:");

    // group by language and file
    const fileGroups: Record<string, Record<string, string[]>> = {};

    for (const [lang, keys] of Object.entries(this.issues.sameAsEnglish)) {
      if (keys.length === 0) continue;

      fileGroups[lang] = {};

      for (const key of keys) {
        const [file, ...keyPath] = key.split(":");
        if (!fileGroups[lang][file]) {
          fileGroups[lang][file] = [];
        }
        fileGroups[lang][file].push(keyPath.join("."));
      }
    }

    // generate translation suggestions for each language
    for (const [lang, files] of Object.entries(fileGroups)) {
      console.log(`\n🌐 ${this.getLanguageName(lang)} (${lang}):`);

      for (const [file, keys] of Object.entries(files)) {
        console.log(`   📄 ${file} (${keys.length} keys need to translate):`);

        // read english file content
        const enPath = path.join(this.messagesDir, "en", file);
        const langPath = path.join(this.messagesDir, lang, file);

        if (fs.existsSync(enPath) && fs.existsSync(langPath)) {
          const enData = this.loadJsonFile(enPath);
          const langData = this.loadJsonFile(langPath);

          // Generate translation suggestions
          const suggestions = this.generateTranslationSuggestions(enData, langData, keys);
          console.log(`   💡 Translation suggestions:`);
          console.log(`      // keys need to translate:`);
          suggestions.forEach((suggestion) => {
            console.log(`      "${suggestion.key}": "${suggestion.suggestion}",`);
          });
        }
      }
    }
  }

  private getLanguageName(lang: string): string {
    const languageNames: Record<string, string> = {
      zh: "简体中文",
      "zh-HK": "繁体中文（香港）",
      de: "德语",
      es: "西班牙语",
      fr: "法语",
      it: "意大利语",
      ja: "日语",
      ko: "韩语",
      pt: "葡萄牙语",
    };
    return languageNames[lang] || lang;
  }

  private generateTranslationSuggestions(
    enData: TranslationData,
    langData: TranslationData,
    keys: string[]
  ): Array<{ key: string; suggestion: string }> {
    const suggestions: Array<{ key: string; suggestion: string }> = [];

    for (const key of keys) {
      const value = this.getNestedValue(enData, key);
      if (value && typeof value === "string") {
        suggestions.push({
          key,
          suggestion: this.getTranslationSuggestion(key, value, langData),
        });
      }
    }

    return suggestions;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private getTranslationSuggestion(key: string, value: string, langData: TranslationData): string {
    // here can provide some basic translation suggestions based on the key and value
    // in actual project, can integrate translation API

    const commonTranslations: Record<string, Record<string, string>> = {
      "N/A": {
        zh: "不适用",
        "zh-HK": "不適用",
        de: "Nicht verfügbar",
        es: "No aplica",
        fr: "Non applicable",
        it: "Non applicabile",
        ja: "該当なし",
        ko: "해당 없음",
        pt: "Não aplicável",
      },
      Unknown: {
        zh: "未知",
        "zh-HK": "未知",
        de: "Unbekannt",
        es: "Desconocido",
        fr: "Inconnu",
        it: "Sconosciuto",
        ja: "不明",
        ko: "알 수 없음",
        pt: "Desconhecido",
      },
      Status: {
        zh: "状态",
        "zh-HK": "狀態",
        de: "Status",
        es: "Estado",
        fr: "Statut",
        it: "Stato",
        ja: "ステータス",
        ko: "상태",
        pt: "Status",
      },
      Actions: {
        zh: "操作",
        "zh-HK": "操作",
        de: "Aktionen",
        es: "Acciones",
        fr: "Actions",
        it: "Azioni",
        ja: "アクション",
        ko: "작업",
        pt: "Ações",
      },
    };

    // try to infer language from file path
    const langMatch = Object.keys(langData).find((lang) =>
      ["zh", "zh-HK", "de", "es", "fr", "it", "ja", "ko", "pt"].includes(lang)
    );

    if (langMatch && commonTranslations[value] && commonTranslations[value][langMatch]) {
      return commonTranslations[value][langMatch];
    }

    // if no predefined translation is found, return placeholder
    return `[需要翻译: ${value}]`;
  }
}

// run check
async function main() {
  const checker = new I18nChecker();
  await checker.run();
}

if (require.main === module) {
  main().catch(console.error);
}
