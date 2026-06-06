import React from "react";
import type { Question } from "../Types";

export type MockQuestion = Question & {
  section?: string;
  instruction?: string;
  passage?: string;
  imageUrl?: string;
  raw?: unknown;
};

export type SubjectScore = {
  correct: number;
  total: number;
  score: number;
};

type FetchFromALOCOptions = {
  subject: string;
  year?: string;
  requiredCount?: number;
  accessToken?: string;
  baseUrl?: string;
  fallbackQuestions?: Question[];
};

export const EXAM_YEARS = Array.from({ length: 10 }, (_, i) =>
  (2016 + i).toString(),
);

const ALLOWED_HTML_TAGS = new Set([
  "B",
  "BR",
  "EM",
  "I",
  "P",
  "SMALL",
  "SPAN",
  "STRONG",
  "SUB",
  "SUP",
  "U",
]);

const textFrom = (...values: unknown[]) =>
  values
    .find((value) => typeof value === "string" && value.trim().length > 0)
    ?.toString()
    .trim() || "";

export const subjectToApiParam = (subject: string) => {
  const normalized = subject.trim().toLowerCase();
  const aliases: Record<string, string> = {
    crs: "crk",
    "crs/irs": "crk",
    "christian religious studies": "crk",
    literature: "literature",
    "literature in english": "literature",
  };

  return aliases[normalized] || normalized;
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "").trim();

const optionLabel = (index: number) => String.fromCharCode(65 + index);

const hasStressMarkedOptions = (options: string[]) =>
  options.some((option) => /[A-Z]{2,}/.test(stripHtml(option)));

const resolveMediaUrl = (value: string) => {
  const media = value.trim();
  if (!media) return "";
  if (/^https?:\/\//i.test(media)) return media;
  if (media.startsWith("//")) return `https:${media}`;
  if (media.startsWith("/")) return `https://questions.aloc.com.ng${media}`;
  return `https://questions.aloc.com.ng/${media.replace(/^\.?\//, "")}`;
};

const extractImageFromHtml = (...values: string[]) => {
  for (const value of values) {
    const match = value.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1]) return resolveMediaUrl(match[1]);
  }
  return "";
};

const mediaFrom = (apiQuestion: any) =>
  textFrom(
    apiQuestion.image,
    apiQuestion.image_url,
    apiQuestion.imageUrl,
    apiQuestion.question_image,
    apiQuestion.questionImage,
    apiQuestion.diagram,
    apiQuestion.diagram_url,
    apiQuestion.figure,
    apiQuestion.figure_url,
    apiQuestion.media,
    apiQuestion.media_url,
    apiQuestion.file,
  );

export const buildGeneratedExplanation = (question: {
  text: string;
  options: string[];
  answer: number;
  instruction?: string;
}) => {
  const correctOption = question.options[question.answer] || "";
  const plainCorrect = stripHtml(correctOption);
  const plainQuestion = stripHtml(question.text);
  const instruction = stripHtml(question.instruction || "").toLowerCase();
  const label = optionLabel(question.answer);

  if (hasStressMarkedOptions(question.options)) {
    const stressedPart = plainCorrect.match(/[A-Z]{2,}/g)?.join("-") || "";
    const stressText = stressedPart
      ? ` The capitalized part <strong>${stressedPart}</strong> shows the syllable that should receive the strongest voice stress.`
      : "";

    return `This is a word-stress question. In this question type, the capital letters show where the main stress should fall. The correct answer is <strong>${label}. ${plainCorrect}</strong>.${stressText} So <strong>${plainQuestion}</strong> should be pronounced with that syllable stronger than the others.`;
  }

  if (instruction.includes("nearest in meaning")) {
    return `The correct answer is <strong>${label}. ${plainCorrect}</strong> because it is closest in meaning to the key word or phrase in the question. Read the sentence first, then choose the option that keeps the original meaning without changing the context.`;
  }

  if (
    instruction.includes("opposite in meaning") ||
    instruction.includes("opposite")
  ) {
    return `The correct answer is <strong>${label}. ${plainCorrect}</strong> because it gives the opposite meaning required by the instruction. Always check whether the question asks for a synonym or an antonym before selecting an option.`;
  }

  return `The correct answer is <strong>${label}. ${plainCorrect}</strong>. The API did not include a worked solution for this item, so JAMBIFY is showing the answer-key explanation: compare the question with the options and choose the option that best satisfies the instruction.`;
};

export const clampExamYear = (year: string) => {
  if (year === "Random") return "Random";
  const numericYear = Number.parseInt(year, 10);
  if (Number.isNaN(numericYear)) return "2025";
  return Math.min(2025, Math.max(2016, numericYear)).toString();
};

export const sanitizeHtml = (html: string) => {
  if (!html) return "";
  if (typeof document === "undefined") return html;

  const template = document.createElement("template");
  template.innerHTML = html;

  const cleanNode = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (!ALLOWED_HTML_TAGS.has(element.tagName)) {
        element.replaceWith(...Array.from(element.childNodes));
        return;
      }

      Array.from(element.attributes).forEach((attr) => {
        element.removeAttribute(attr.name);
      });
    }

    Array.from(node.childNodes).forEach(cleanNode);
  };

  Array.from(template.content.childNodes).forEach(cleanNode);
  return template.innerHTML;
};

export const HtmlContent: React.FC<{
  html?: string;
  as?: "div" | "p" | "span";
  className?: string;
}> = ({ html = "", as = "div", className }) => {
  const Component = as;
  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
};

export const QuestionMedia: React.FC<{
  src?: string;
  alt?: string;
  className?: string;
}> = ({ src, alt = "Question diagram", className }) => {
  if (!src) return null;

  return (
    <figure className={className}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="rounded-brand border-borderMuted bg-bgSurface max-h-72 w-full border object-contain"
      />
    </figure>
  );
};

export const mapApiQuestion = (
  apiQuestion: any,
  subject: string,
  year: string,
): MockQuestion => {
  let answerStr = apiQuestion.answer?.toString().toLowerCase() || "";
  if (answerStr.includes("_")) answerStr = answerStr.split("_").pop() || "";

  const answerIndex = ["a", "b", "c", "d"].indexOf(answerStr);
  const option = apiQuestion.option || apiQuestion.options || {};

  const section = textFrom(
    apiQuestion.section,
    apiQuestion.category,
    apiQuestion.topic,
    apiQuestion.type,
  );
  const instruction = textFrom(
    apiQuestion.instruction,
    apiQuestion.instructions,
    apiQuestion.direction,
    apiQuestion.directions,
    apiQuestion.passage,
  );
  const passage = textFrom(
    apiQuestion.passage,
    apiQuestion.comprehension,
    apiQuestion.comprehension_passage,
    apiQuestion.text,
  );
  const text = textFrom(apiQuestion.question, apiQuestion.question_text);
  const directMedia = mediaFrom(apiQuestion);
  const imageUrl = directMedia
    ? resolveMediaUrl(directMedia)
    : extractImageFromHtml(text, passage);

  const mappedQuestion = {
    id: apiQuestion.id?.toString() || crypto.randomUUID(),
    subject: subject as MockQuestion["subject"],
    year: Number.parseInt(apiQuestion.examyear || year, 10),
    difficulty: "Medium" as const,
    text,
    options: [
      textFrom(option.a, option.option_a),
      textFrom(option.b, option.option_b),
      textFrom(option.c, option.option_c),
      textFrom(option.d, option.option_d),
    ],
    answer: answerIndex !== -1 ? answerIndex : 0,
    explanation: textFrom(apiQuestion.explanation, apiQuestion.solution),
    topic: section || "General",
    section,
    instruction,
    passage,
    imageUrl,
    raw: apiQuestion,
  };

  return {
    ...mappedQuestion,
    explanation:
      mappedQuestion.explanation || buildGeneratedExplanation(mappedQuestion),
  };
};

const parseALOCResponse = async (response: Response) => {
  const payload = await response.json().catch(() => ({}));
  const data = Array.isArray(payload?.data)
    ? payload.data
    : payload?.data
      ? [payload.data]
      : [];

  return {
    status: payload?.status || response.status,
    data,
    message: payload?.message || payload?.error || response.statusText,
  };
};

const uniqueByQuestionKey = (questions: MockQuestion[]) => {
  const unique = new Map<string, MockQuestion>();

  questions.forEach((question) => {
    const key = `${question.subject}-${question.year}-${question.id}`;
    if (!unique.has(key)) unique.set(key, question);
  });

  return Array.from(unique.values());
};

const fallbackFromSamples = (
  subject: string,
  year: string | undefined,
  requiredCount: number,
  fallbackQuestions: Question[] = [],
) => {
  const safeYear = year && year !== "Random" ? clampExamYear(year) : "";
  const matching = fallbackQuestions.filter(
    (question) =>
      question.subject === subject &&
      (!safeYear || question.year.toString() === safeYear),
  );
  const subjectAnyYear = fallbackQuestions.filter(
    (question) => question.subject === subject,
  );
  const source = matching.length > 0 ? matching : subjectAnyYear;

  if (source.length === 0) return [];

  return Array.from({ length: requiredCount }, (_, index) => {
    const question = source[index % source.length];
    return {
      ...(question as MockQuestion),
      id: `fallback-${subject}-${question.id}-${index}`,
    };
  });
};

export const fetchFromALOC = async ({
  subject,
  year = "Random",
  requiredCount = subject === "English" ? 60 : 40,
  accessToken = "QB-7fc09bca27e03f86152d",
  baseUrl = "https://questions.aloc.com.ng/api/v2",
  fallbackQuestions = [],
}: FetchFromALOCOptions): Promise<MockQuestion[]> => {
  const safeYear = year === "Random" ? "Random" : clampExamYear(year);
  const apiSubject = subjectToApiParam(subject);
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    AccessToken: accessToken,
  };

  const buildUrl = (endpoint: "m" | "q") => {
    const params = new URLSearchParams({ subject: apiSubject });
    if (safeYear !== "Random") params.set("year", safeYear);
    return `${baseUrl.replace(/\/$/, "")}/${endpoint}?${params.toString()}`;
  };

  const fetchEndpoint = async (endpoint: "m" | "q") => {
    const url = buildUrl(endpoint);
    console.debug(`[ALOC] Fetching ${subject}: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers,
    });

    if ([403, 404, 406].includes(response.status)) {
      console.warn(`[ALOC] ${response.status} for ${subject} at ${url}`);
      return [];
    }

    if (!response.ok) {
      console.warn(`[ALOC] HTTP ${response.status} for ${subject} at ${url}`);
      return [];
    }

    const result = await parseALOCResponse(response);
    if (result.status !== 200) {
      console.warn(`[ALOC] API status ${result.status}: ${result.message}`);
      return [];
    }

    return result.data.map((item: any) =>
      mapApiQuestion(
        item,
        subject,
        safeYear === "Random" ? item.examyear || "" : safeYear,
      ),
    );
  };

  try {
    const batchQuestions = await fetchEndpoint("m");
    let questions = uniqueByQuestionKey(batchQuestions);

    if (questions.length < requiredCount && subject === "English") {
      const extraNeeded = requiredCount - questions.length;
      const extraCalls = await Promise.all(
        Array.from({ length: extraNeeded }, () => fetchEndpoint("q")),
      );
      questions = uniqueByQuestionKey([...questions, ...extraCalls.flat()]);
    }

    if (questions.length < requiredCount) {
      console.warn(
        `[ALOC] ${subject} returned ${questions.length}/${requiredCount}. Filling remaining slots from SAMPLE_QUESTIONS.`,
      );
      const fallback = fallbackFromSamples(
        subject,
        safeYear,
        requiredCount - questions.length,
        fallbackQuestions,
      );
      questions = uniqueByQuestionKey([...questions, ...fallback]);
    }

    return questions.slice(0, requiredCount).map((question, index) => ({
      ...question,
      id: `${question.subject}-${question.year}-${question.id}-${index}`,
    }));
  } catch (error) {
    console.error(`[ALOC] Failed to fetch ${subject}:`, error);
    return fallbackFromSamples(
      subject,
      safeYear,
      requiredCount,
      fallbackQuestions,
    );
  }
};

export const buildSubjectScores = (
  questions: MockQuestion[],
  answers: Record<number, number>,
): Record<string, SubjectScore> => {
  const scores: Record<string, SubjectScore> = {};

  questions.forEach((question, index) => {
    if (!scores[question.subject]) {
      scores[question.subject] = { correct: 0, total: 0, score: 0 };
    }

    scores[question.subject].total += 1;
    if (answers[index] === question.answer) {
      scores[question.subject].correct += 1;
    }
  });

  Object.values(scores).forEach((subject) => {
    subject.score =
      subject.total > 0
        ? Math.round((subject.correct / subject.total) * 100)
        : 0;
  });

  return scores;
};

export const calculateJambScore = (
  questions: MockQuestion[],
  answers: Record<number, number>,
) => {
  const subjectScores = buildSubjectScores(questions, answers);
  const totalScore = Object.values(subjectScores).reduce(
    (sum, subject) => sum + subject.score,
    0,
  );

  return {
    totalScore: Math.min(400, Math.round(totalScore)),
    subjectScores,
  };
};
