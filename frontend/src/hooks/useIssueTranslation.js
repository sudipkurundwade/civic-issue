import * as React from "react";
import { issueService } from "@/services/issueService";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Translates a list of issues' descriptions to the current UI language using Gemini.
 *
 * - Returns the original description immediately (no flicker).
 * - Fires translations in the background per issue when lang changes.
 * - Uses an in-memory cache keyed by `${issueId}-${lang}` to avoid re-fetching.
 * - Falls back to the original description on any error.
 *
 * @param {Array}  issues     - Array of issue objects (each must have `.id` and `.description`)
 * @returns {Function} getDesc(issue) → translated description string
 */

const translationCache = new Map(); // module-level so it persists across re-mounts

export function useIssueTranslation(issues) {
    const { lang } = useLanguage();
    const [translated, setTranslated] = React.useState({}); // { [issueId]: translatedDescription }

    React.useEffect(() => {
        if (!Array.isArray(issues) || issues.length === 0) return;
        if (lang === "en") {
            setTranslated({}); // Clear to show originals
            return;
        }

        let cancelled = false;

        async function translateAll() {
            const updates = {};
            await Promise.all(
                issues.map(async (issue) => {
                    const id = issue.id || issue._id;
                    const cacheKey = `${id}-${lang}`;
                    if (translationCache.has(cacheKey)) {
                        updates[id] = translationCache.get(cacheKey);
                        return;
                    }
                    if (!issue.description) return;
                    const result = await issueService.translateText(issue.description, lang);
                    translationCache.set(cacheKey, result);
                    updates[id] = result;
                })
            );
            if (!cancelled) {
                setTranslated((prev) => ({ ...prev, ...updates }));
            }
        }

        translateAll();
        return () => { cancelled = true; };
    }, [issues, lang]);

    /**
     * Returns the translated description for an issue, or original while translating.
     */
    function getDesc(issue) {
        if (lang === "en") return issue.description;
        const id = issue.id || issue._id;
        return translated[id] || issue.description;
    }

    return getDesc;
}
