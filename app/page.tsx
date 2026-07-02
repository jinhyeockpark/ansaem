"use client";

import { useEffect, useMemo, useState } from "react";
import {
  categories,
  services,
  type Service,
  type ServiceCategory,
} from "./data/services";
const GOOGLE_FORM_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSftspPGPFQvL7uXbaCZyKTDw_rdE9m-7IdN8EGU0_9GZgXl-A/formResponse";

const GOOGLE_FORM_EMAIL_ENTRY_ID = "entry.184682562";

type ResultKey =
  | "smart"
  | "overSubscribed"
  | "ottOverlap"
  | "premiumHabit"
  | "creatorWaste"
  | "lazyCancel";

type SavedDiagnosisState = {
  selectedServices?: string[];
  billingDays?: Record<string, string>;
  trialEndDates?: Record<string, string>;
  budget?: string;
  ottUsage?: string;
  youtubeUsage?: string;
  adStress?: string;
  creatorUsage?: string;
  aiUsage?: string;
  cancelHabit?: string;
  customServices: Service[];
};



const resultData: Record<
  ResultKey,
  {
    title: string;
    subtitle: string;
    description: string;
    actions: string[];
  }
> = {
  smart: {
    title: "알뜰 구독형",
    subtitle: "필요한 구독만 꽤 잘 쓰고 있어요.",
    description:
      "현재 구독 상태가 건강한 편이에요. 불필요한 중복 구독은 적고, 실제 사용량 대비 지출도 적정해 보입니다.",
    actions: [
      "현재 구독 대부분은 유지해도 괜찮아요.",
      "무료체험 종료일만 놓치지 않게 체크해보세요.",
      "자주 쓰는 서비스는 연간 결제 할인 여부를 확인해보세요.",
      "카드나 통신사 할인 적용 여부를 한 번 점검해보세요.",
    ],
  },
  overSubscribed: {
    title: "구독 과다형",
    subtitle: "매달 나가는 구독비가 사용량보다 많아 보여요.",
    description:
      "하나씩 보면 작아 보여도, 연간으로 보면 꽤 큰 금액이 자동결제로 빠져나갈 수 있습니다.",
    actions: [
      "한 달에 1~2번 이하로 쓰는 서비스부터 점검해보세요.",
      "비슷한 기능을 하는 중복 서비스를 하나로 줄여보세요.",
      "OTT는 이번 달 볼 콘텐츠가 있는 서비스만 남겨보세요.",
      "다음 결제일 3일 전에 알림을 설정해보세요.",
    ],
  },
  ottOverlap: {
    title: "OTT 중복형",
    subtitle: "영상 구독이 겹쳐 있어요.",
    description:
      "여러 OTT를 동시에 유지하기보다, 보고 싶은 콘텐츠가 있을 때만 한 달씩 돌려 쓰는 방식이 더 효율적일 수 있습니다.",
    actions: [
      "이번 달 볼 콘텐츠가 없는 OTT는 잠시 해지해보세요.",
      "넷플릭스, 티빙, 디즈니+ 같은 서비스는 순환 구독이 효율적일 수 있어요.",
      "OTT를 주 1회 이하로 본다면 2개 이상 동시 구독은 비효율적일 수 있어요.",
      "쿠팡와우처럼 배송 혜택까지 함께 쓰는 서비스는 따로 판단해보세요.",
    ],
  },
  premiumHabit: {
    title: "프리미엄 습관형",
    subtitle: "편해서 유지하는 구독이 많은 편이에요.",
    description:
      "유튜브 프리미엄, 음악앱, 쇼핑 멤버십처럼 하나하나는 작아 보여도 합치면 고정비가 커질 수 있습니다.",
    actions: [
      "유튜브를 하루 1시간 이상 본다면 유튜브 프리미엄은 유지 가치가 높을 수 있어요.",
      "유튜브 뮤직을 사용한다면 별도 음악앱 유지가 필요한지 점검해보세요.",
      "쿠팡와우, 네이버플러스는 실제 쇼핑 빈도와 혜택 사용량 기준으로 판단해보세요.",
      "없으면 정말 불편한가를 기준으로 하나씩 정리해보세요.",
    ],
  },
  creatorWaste: {
    title: "작업툴 낭비형",
    subtitle: "작업툴 구독비가 새고 있을 가능성이 있어요.",
    description:
      "프리미어프로, Canva, CapCut, AI툴 같은 작업 관련 구독이 실제 사용 빈도에 비해 과할 수 있습니다.",
    actions: [
      "쇼츠나 릴스 위주라면 프리미어프로보다 CapCut, Canva, 무료 편집툴을 먼저 고려해보세요.",
      "전문 디자인 작업이 아니라면 Canva Pro 유지 여부를 다시 점검해보세요.",
      "AI툴은 매일 사용하지 않는다면 무료 플랜으로 충분한지 확인해보세요.",
      "Adobe 전체 플랜을 쓰고 있다면 실제로 쓰는 프로그램 수를 먼저 확인해보세요.",
    ],
  },
  lazyCancel: {
    title: "해지 귀찮음형",
    subtitle: "필요해서라기보다 해지를 미뤄서 나가고 있을 수 있어요.",
    description:
      "자동결제일만 정리해도 바로 절약 효과가 날 수 있습니다. 무료체험, 이벤트 가입, 방치된 구독부터 확인해보세요.",
    actions: [
      "오늘 바로 카드 결제내역에서 정기결제를 확인해보세요.",
      "30일 이상 사용하지 않은 서비스는 해지 후보로 분류해보세요.",
      "무료체험은 가입 즉시 종료일 알림을 설정해두세요.",
      "매달 1일을 구독 점검일로 정해보세요.",
    ],
  },
};

const money = (value: number) => value.toLocaleString("ko-KR");
const formatDate = (value: string) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00`));
};
export default function Home() {
  const [started, setStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [billingDays, setBillingDays] = useState<Record<string, string>>({});
  const [trialEndDates, setTrialEndDates] = useState<Record<string, string>>({});
  const [premiumEmail, setPremiumEmail] = useState("");
const [emailSubmitted, setEmailSubmitted] = useState(false);
const [emailError, setEmailError] = useState("");
const [customServices, setCustomServices] = useState<Service[]>([]);
const [customName, setCustomName] = useState("");
const [customPrice, setCustomPrice] = useState("");
const [customCategory, setCustomCategory] = useState<ServiceCategory>("OTT");
const [customError, setCustomError] = useState("");
const [hasLoadedSavedState, setHasLoadedSavedState] = useState(false);
  const [budget, setBudget] = useState("50000");
  const [ottUsage, setOttUsage] = useState("weekly");
  const [youtubeUsage, setYoutubeUsage] = useState("oneHour");
  const [adStress, setAdStress] = useState("medium");
  const [creatorUsage, setCreatorUsage] = useState("none");
  const [aiUsage, setAiUsage] = useState("rare");
  const [cancelHabit, setCancelHabit] = useState("sometimes");
useEffect(() => {
  const saved = window.localStorage.getItem("subscriptionDiagnosisState");

  if (!saved) {
    setHasLoadedSavedState(true);
    return;
  }

  try {
    const parsed = JSON.parse(saved) as SavedDiagnosisState;

    if (parsed.selectedServices) setSelectedServices(parsed.selectedServices);
    if (parsed.billingDays) setBillingDays(parsed.billingDays);
    if (parsed.trialEndDates) setTrialEndDates(parsed.trialEndDates);
    if (parsed.budget) setBudget(parsed.budget);
    if (parsed.ottUsage) setOttUsage(parsed.ottUsage);
    if (parsed.youtubeUsage) setYoutubeUsage(parsed.youtubeUsage);
    if (parsed.adStress) setAdStress(parsed.adStress);
    if (parsed.creatorUsage) setCreatorUsage(parsed.creatorUsage);
    if (parsed.aiUsage) setAiUsage(parsed.aiUsage);
    if (parsed.cancelHabit) setCancelHabit(parsed.cancelHabit);
    if (parsed.customServices) setCustomServices(parsed.customServices);
  } catch {
    window.localStorage.removeItem("subscriptionDiagnosisState");
  }

  setHasLoadedSavedState(true);
}, []);
useEffect(() => {
  if (!hasLoadedSavedState) return;

  const stateToSave: SavedDiagnosisState = {
    selectedServices,
    billingDays,
    trialEndDates,
    budget,
    ottUsage,
    youtubeUsage,
    adStress,
    creatorUsage,
    aiUsage,
    cancelHabit,
    customServices,
  };

  window.localStorage.setItem(
    "subscriptionDiagnosisState",
    JSON.stringify(stateToSave)
  );
}, [
  hasLoadedSavedState,
  selectedServices,
  billingDays,
  trialEndDates,
  budget,
  ottUsage,
  youtubeUsage,
  adStress,
  creatorUsage,
  aiUsage,
  cancelHabit,
  customServices,
]);
const allServices = useMemo(
  () => [...services, ...customServices],
  [customServices],
);
  const selected = useMemo(
  () =>
    allServices.filter((service) => selectedServices.includes(service.id)),
  [allServices, selectedServices],
);

  const monthlyTotal = selected.reduce((sum, service) => sum + service.price, 0);

  const selectedOtt = selected.filter((service) => service.category === "OTT");
  const selectedMusic = selected.filter(
    (service) =>
      service.category === "영상·음악" &&
      service.id !== "youtube_premium"
  );
  const selectedCreator = selected.filter(
    (service) => service.category === "작업·창작툴"
  );
  const selectedAi = selected.filter((service) => service.category === "AI툴");
  const selectedLife = selected.filter(
    (service) => service.category === "생활 멤버십"
  );

  const analysis = useMemo(() => {
    const scores: Record<ResultKey, number> = {
      smart: 0,
      overSubscribed: 0,
      ottOverlap: 0,
      premiumHabit: 0,
      creatorWaste: 0,
      lazyCancel: 0,
    };

    const budgetNumber = Number(budget);

    if (monthlyTotal > budgetNumber) scores.overSubscribed += 3;
    if (monthlyTotal >= 70000) scores.overSubscribed += 3;
    if (selected.length >= 8) scores.overSubscribed += 2;

    if (selectedOtt.length >= 2) scores.ottOverlap += 2;
    if (selectedOtt.length >= 3) scores.ottOverlap += 2;
    if (selectedOtt.length >= 2 && ["none", "rare"].includes(ottUsage)) {
      scores.ottOverlap += 4;
    }

    if (
      selectedServices.includes("youtube_premium") &&
      selectedMusic.length >= 1
    ) {
      scores.premiumHabit += 3;
    }
    if (selectedLife.length >= 2) scores.premiumHabit += 2;
    if (
      selectedServices.includes("youtube_premium") &&
      ["twoHours", "always"].includes(youtubeUsage)
    ) {
      scores.premiumHabit += 1;
    }

    const hasExpensiveCreatorTool =
      selectedServices.includes("premiere_pro") ||
      selectedServices.includes("photoshop") ||
      selectedServices.includes("adobe_cc");

    if (
      hasExpensiveCreatorTool &&
      ["none", "shorts"].includes(creatorUsage)
    ) {
      scores.creatorWaste += 5;
    }

    if (selectedCreator.length >= 3 && creatorUsage !== "professional") {
      scores.creatorWaste += 3;
    }

    if (selectedAi.length >= 2 && ["none", "rare"].includes(aiUsage)) {
      scores.creatorWaste += 2;
    }

    if (["lazy", "miss", "unknown"].includes(cancelHabit)) {
      scores.lazyCancel += 4;
    }

    if (
      monthlyTotal <= budgetNumber &&
      selected.length <= 5 &&
      !["none", "rare"].includes(ottUsage) &&
      !["lazy", "miss", "unknown"].includes(cancelHabit)
    ) {
      scores.smart += 5;
    }

    let resultKey = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as ResultKey;

    if (monthlyTotal === 0) {
      resultKey = "smart";
    }

    let saving = 0;

    if (selectedOtt.length >= 2 && ["none", "rare"].includes(ottUsage)) {
      const ottPrices = selectedOtt.map((service) => service.price).sort((a, b) => b - a);
      saving += ottPrices.slice(0, Math.max(1, selectedOtt.length - 1)).reduce((a, b) => a + b, 0);
    }

    if (
      selectedServices.includes("youtube_premium") &&
      selectedMusic.length >= 1
    ) {
      saving += selectedMusic.reduce((sum, service) => sum + service.price, 0);
    }

    if (
      hasExpensiveCreatorTool &&
      ["none", "shorts"].includes(creatorUsage)
    ) {
      const expensiveCreator = selectedCreator
        .filter((service) => service.price >= 20000)
        .reduce((sum, service) => sum + service.price, 0);
      saving += expensiveCreator;
    }

    if (selectedAi.length >= 2 && ["none", "rare"].includes(aiUsage)) {
      saving += Math.max(0, selectedAi.reduce((sum, service) => sum + service.price, 0) - 29000);
    }

    if (monthlyTotal > budgetNumber) {
      saving += Math.floor((monthlyTotal - budgetNumber) * 0.4);
    }

    if (["lazy", "miss", "unknown"].includes(cancelHabit)) {
      saving += 5000;
    }

    saving = Math.min(saving, Math.floor(monthlyTotal * 0.65));

    return {
      resultKey,
      saving,
      yearlySaving: saving * 12,
      scores,
    };
  }, [
    budget,
    monthlyTotal,
    selected.length,
    selectedOtt,
    selectedMusic,
    selectedCreator,
    selectedAi,
    selectedLife,
    selectedServices,
    ottUsage,
    youtubeUsage,
    creatorUsage,
    aiUsage,
    cancelHabit,
  ]);
const billingSchedule = useMemo(() => {
  return selected
    .map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      billingDay: billingDays[service.id]
        ? Number(billingDays[service.id])
        : null,
    }))
    .filter(
      (item) =>
        item.billingDay !== null &&
        !Number.isNaN(item.billingDay)
    )
    .sort((a, b) => Number(a.billingDay) - Number(b.billingDay));
}, [selected, billingDays]);
const trialSchedule = useMemo(() => {
  return selected
    .filter((service) => service.freeTrialDays)
    .map((service) => ({
      id: service.id,
      name: service.name,
      freeTrialDays: service.freeTrialDays,
      endDate: trialEndDates[service.id] ?? "",
    }))
    .filter((item) => item.endDate !== "")
    .sort(
      (a, b) =>
        new Date(`${a.endDate}T00:00:00`).getTime() -
        new Date(`${b.endDate}T00:00:00`).getTime()
    );
}, [selected, trialEndDates]);
  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  const addCustomService = () => {
  const name = customName.trim();
  const price = Number(customPrice.replace(/,/g, "").trim());

  if (!name) {
    setCustomError("구독 서비스 이름을 입력해주세요.");
    return;
  }

  if (!price || price < 100) {
    setCustomError("월 구독료를 100원 이상으로 입력해주세요.");
    return;
  }

  const newService: Service = {
    id: `custom-${Date.now()}`,
    name,
    category: customCategory,
    price,
    tags: ["직접 추가"],
    note: "사용자가 직접 추가한 구독 서비스입니다.",
    lastUpdated: "직접 입력",
  };

  setCustomServices((prev) => [...prev, newService]);
  setSelectedServices((prev) => [...prev, newService.id]);

  setCustomName("");
  setCustomPrice("");
  setCustomCategory("OTT");
  setCustomError("");
};

const removeCustomService = (serviceId: string) => {
  setCustomServices((prev) =>
    prev.filter((service) => service.id !== serviceId),
  );

  setSelectedServices((prev) => prev.filter((id) => id !== serviceId));

  setBillingDays((prev) => {
    const next = { ...prev };
    delete next[serviceId];
    return next;
  });

  setTrialEndDates((prev) => {
    const next = { ...prev };
    delete next[serviceId];
    return next;
  });
};
const updateBillingDay = (serviceId: string, value: string) => {
  const numberValue = Number(value);

  if (value === "" || (numberValue >= 1 && numberValue <= 31)) {
    setBillingDays((prev) => ({
      ...prev,
      [serviceId]: value,
    }));
  }
};const updateTrialEndDate = (serviceId: string, value: string) => {
  setTrialEndDates((prev) => ({
    ...prev,
    [serviceId]: value,
  }));
};
const handlePremiumSignup = async () => {
  const email = premiumEmail.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    setEmailError("올바른 이메일 주소를 입력해주세요.");
    return;
  }

  setEmailError("");

  const formData = new FormData();
  formData.append(GOOGLE_FORM_EMAIL_ENTRY_ID, email);

  try {
    await fetch(GOOGLE_FORM_ACTION_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });

    const savedEmails = JSON.parse(
      localStorage.getItem("premiumSignupEmails") ?? "[]",
    ) as string[];

    if (!savedEmails.includes(email)) {
      localStorage.setItem(
        "premiumSignupEmails",
        JSON.stringify([...savedEmails, email]),
      );
    }

    setPremiumEmail(email);
    setEmailSubmitted(true);
  } catch {
    setEmailError("알림 신청 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
  }
};
  if (!started) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] px-5 py-10 text-slate-950">
        <section className="mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-center">
          <p className="mb-4 inline-flex w-fit rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
            구독비 진단 테스트
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
  매달 새는 구독비,
<br />
안샘에서 막아보세요.
</h1>
         <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
  안샘은 이용 중인 구독 서비스를 선택하면 월 구독비, 절약 가능 금액,
  결제 일정과 무료체험 종료일을 한눈에 정리해주는 구독 관리 서비스입니다.
</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setStarted(true)}
              className="rounded-2xl bg-black px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02]"
            >
              내 구독비 무료 진단하기
            </button>
            <button className="rounded-2xl border border-slate-300 bg-white px-8 py-4 text-lg font-bold text-slate-900">
              예상 소요시간 1분
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (showResult) {
    const result = resultData[analysis.resultKey];

    return (
      <main className="min-h-screen bg-[#f6f7fb] px-5 py-10 text-slate-950">
        <section className="mx-auto max-w-4xl">
          <button
            onClick={() => setShowResult(false)}
            className="mb-6 text-sm font-bold text-slate-500"
          >
            ← 다시 수정하기
          </button>

          <div className="rounded-[2rem] bg-white p-8 shadow-sm md:p-12">
            <p className="mb-3 text-sm font-bold text-slate-500">
              안샘이 분석한 구독비 진단 결과
            </p>
            <h1 className="text-4xl font-black md:text-6xl">
              {result.title}
            </h1>
            <p className="mt-4 text-xl font-bold text-slate-700">
              {result.subtitle}
            </p>
            <p className="mt-5 leading-8 text-slate-600">
              {result.description}
            </p>
<div className="mt-10 rounded-3xl bg-slate-950 p-6 text-white">
  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-sm font-bold text-slate-400">내 구독 관리 요약</p>
      <h2 className="mt-2 text-3xl font-black leading-tight">
        지금 구독 상태를 한눈에 정리했어요.
      </h2>
    </div>
    <p className="text-sm font-bold text-slate-400">
      저장된 입력값 기준
    </p>
  </div>

  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <div className="rounded-2xl bg-white/10 p-5">
      <p className="text-sm font-bold text-slate-300">현재 구독 수</p>
      <p className="mt-2 whitespace-nowrap text-3xl font-black tracking-tight">
        {selected.length}개
      </p>
    </div>

    <div className="rounded-2xl bg-white/10 p-5">
      <p className="text-sm font-bold text-slate-300">예상 월 고정비</p>
      <p className="mt-2 whitespace-nowrap text-3xl font-black tracking-tight">
        {money(monthlyTotal)}원
      </p>
    </div>

    <div className="rounded-2xl bg-white/10 p-5">
      <p className="text-sm font-bold text-slate-300">결제일 입력</p>
      <p className="mt-2 whitespace-nowrap text-3xl font-black tracking-tight">
        {billingSchedule.length}/{selected.length}
      </p>
    </div>

    <div className="rounded-2xl bg-white/10 p-5">
      <p className="text-sm font-bold text-slate-300">체험 종료 예정</p>
      <p className="mt-2 whitespace-nowrap text-3xl font-black tracking-tight">
        {trialSchedule.length}건
      </p>
    </div>

    <div className="rounded-2xl bg-white p-5 text-black">
      <p className="text-sm font-bold text-slate-500">줄일 수 있는 구독비</p>
      <p className="mt-2 whitespace-nowrap text-2xl font-black tracking-tight md:text-3xl">
  {money(analysis.saving)}원
</p>
    </div>
  </div>

  <p className="mt-5 text-sm leading-6 text-slate-400">
    무료 플랜에서는 직접 입력한 정보를 바탕으로 구독 현황을 진단하고, 맞춤 피드백을 제공합니다.
프리미엄 플랜에서는 구독료 결제일, 무료체험 종료일, 구독료 변동 알림, 월간 리포트 등 다양한 구독 관리 서비스를 제공할 예정입니다.
  </p>
</div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-100 p-6">
                <p className="text-sm font-bold text-slate-500">
                  현재 예상 월 구독비
                </p>
                <p className="mt-2 text-3xl font-black">
                  {money(monthlyTotal)}원
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950 p-6 text-white">
                <p className="text-sm font-bold text-slate-300">
                  월 절약 가능 금액
                </p>
                <p className="mt-2 text-3xl font-black">
                  {money(analysis.saving)}원
                </p>
              </div>
              <div className="rounded-3xl bg-slate-100 p-6">
                <p className="text-sm font-bold text-slate-500">
                  연간 절약 가능 금액
                </p>
                <p className="mt-2 text-3xl font-black">
                  {money(analysis.yearlySaving)}원
                </p>
              </div>
            </div>

            <div className="mt-10 rounded-3xl border border-slate-200 p-6">
              <h2 className="text-2xl font-black">추천 액션</h2>
              <ul className="mt-5 space-y-3">
                {result.actions.map((action) => (
                  <li key={action} className="flex gap-3 text-slate-700">
                    <span className="font-black">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 rounded-3xl bg-[#f6f7fb] p-6">
              <h3 className="text-xl font-black">선택한 구독 서비스</h3>
              {selected.length === 0 ? (
                <p className="mt-3 text-slate-500">선택한 구독 서비스가 없습니다.</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.map((service) => (
                    <span
                      key={service.id}
                      className="rounded-full bg-white px-4 py-2 text-sm font-bold"
                    >
                      {service.name} · {money(service.price)}원
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-8 rounded-3xl border border-slate-200 p-6">
  <h3 className="text-xl font-black">먼저 확인해야 할 구독 정보</h3>
  <p className="mt-2 text-sm text-slate-500">
    무료체험, 할인 가능 여부, 요금제 주의사항을 기준으로 지금 바로 확인하면 좋은 정보를 정리했어요.
  </p>

  {selected.length === 0 ? (
    <p className="mt-4 text-slate-500">선택한 구독 서비스가 없습니다.</p>
  ) : (
    <div className="mt-5 space-y-4">
      {selected.map((service) => (
        <div
          key={service.id}
          className="rounded-2xl bg-slate-50 p-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-black">{service.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                월 약 {money(service.price)}원
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {service.freeTrialDays ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                  무료체험 {service.freeTrialDays}일
                </span>
              ) : null}

              {service.hasFreePlan ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                  무료 플랜
                </span>
              ) : null}

              {service.hasAdPlan ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                  광고형 요금제
                </span>
              ) : null}

              {service.discountMethods && service.discountMethods.length > 0 ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                  할인 가능
                </span>
              ) : null}
            </div>
          </div>

          {service.discountMethods && service.discountMethods.length > 0 ? (
            <div className="mt-4">
              <p className="text-sm font-black text-slate-700">확인할 할인 방법</p>
              <p className="mt-1 text-sm text-slate-500">
                {service.discountMethods.join(" · ")}
              </p>
            </div>
          ) : null}

          {service.note ? (
            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="text-sm font-black text-slate-700">체크포인트</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {service.note}
              </p>
            </div>
          ) : null}

          {service.freeTrialDays ? (
            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="text-sm font-black text-slate-700">무료체험 관리</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                무료체험을 시작했다면 종료일 3일 전 알림을 설정해두는 것을 추천해요.
              </p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )}
</div>
<div className="mt-8 rounded-3xl border border-slate-200 p-6">
  <h3 className="text-xl font-black">이번 달 구독 결제 일정</h3>
  <p className="mt-2 text-sm text-slate-500">
    입력한 결제일을 기준으로 이번 달 빠져나갈 구독료를 날짜순으로 정리했어요.
  </p>

  {billingSchedule.length === 0 ? (
    <div className="mt-5 rounded-2xl bg-slate-50 p-5">
      <p className="font-bold text-slate-600">
        아직 입력된 결제일이 없어요.
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        결제일을 입력하면 이곳에 월별 구독 결제 일정이 표시됩니다.
        나중에는 무료체험 종료일, 해지 알림, 결제 전 알림까지 연결할 수 있어요.
      </p>
    </div>
  ) : (
    <div className="mt-5 space-y-3">
      {billingSchedule.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-lg font-black">매월 {item.billingDay}일</p>
            <p className="mt-1 text-sm text-slate-500">{item.name}</p>
          </div>
          <p className="text-xl font-black">{money(item.price)}원</p>
        </div>
      ))}

      <div className="mt-4 rounded-2xl bg-black p-5 text-white">
        <p className="text-sm font-bold text-slate-300">
          입력한 결제일 기준 이번 달 구독 합계
        </p>
        <p className="mt-2 text-3xl font-black">
          {money(
            billingSchedule.reduce((sum, item) => sum + item.price, 0)
          )}
          원
        </p>
      </div>
    </div>
  )}
</div>
<div className="mt-8 rounded-3xl border border-slate-200 p-6">
  <h3 className="text-xl font-black">체험 종료 예정</h3>
  <p className="mt-2 text-sm text-slate-500">
    무료체험이 끝나기 전에 계속 사용할지, 해지할지 미리 결정할 수 있도록 정리했어요.
  </p>

  {trialSchedule.length === 0 ? (
    <div className="mt-5 rounded-2xl bg-slate-50 p-5">
      <p className="font-bold text-slate-600">
        아직 입력된 무료체험 종료일이 없어요.
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        무료체험 종료일을 입력하면 이곳에 종료 예정 서비스가 표시됩니다.
      </p>
    </div>
  ) : (
    <div className="mt-5 space-y-3">
      {trialSchedule.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl bg-slate-50 p-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-black">{formatDate(item.endDate)}</p>
              <p className="mt-1 text-sm text-slate-500">
                {item.name} 무료체험 종료 예정
              </p>
            </div>
            <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
              무료체험 {item.freeTrialDays}일
            </span>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4">
            <p className="text-sm font-black text-slate-700">체크포인트</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              계속 사용할 서비스라면 유지하고, 아니라면 종료일 전에 해지 여부를 확인해보세요. 무료체험 종료 후 자동결제될 수 있어요.
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
<div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
  <p className="text-sm font-bold text-slate-500">무료 플랜 / 프리미엄 플랜</p>
  <h3 className="mt-2 text-2xl font-black">
    무료로 진단하고, 안샘이 계속 관리해드릴게요.
  </h3>
  <p className="mt-3 text-sm leading-6 text-slate-500">
    무료 플랜은 직접 입력한 정보를 바탕으로 구독 현황을 진단하고, 프리미엄 플랜은 결제일과 무료체험 종료일을 대신 챙겨주는 방향으로 준비 중입니다.
  </p>

  <div className="mt-6 grid gap-4 md:grid-cols-2">
    <div className="rounded-3xl bg-slate-50 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">FREE</p>
          <h4 className="mt-1 text-2xl font-black">무료 플랜</h4>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">
          현재 제공
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        직접 입력한 정보를 기반으로 구독 현황을 진단하고, 필요한 피드백을 제공합니다.
      </p>

      <ul className="mt-5 space-y-3 text-sm font-bold text-slate-700">
        <li>✓ 구독비 진단 결과</li>
        <li>✓ 예상 월 고정비 계산</li>
        <li>✓ 절약 가능 금액 확인</li>
        <li>✓ 결제일 직접 입력</li>
        <li>✓ 무료체험 종료일 직접 입력</li>
        <li>✓ 구독 결제 일정표</li>
        <li>✓ 기본 추천 액션</li>
      </ul>
    </div>

    <div className="rounded-3xl bg-slate-950 p-6 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-400">PREMIUM</p>
          <h4 className="mt-1 text-2xl font-black">프리미엄 플랜</h4>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
          준비 중
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">
        구독료 결제일, 무료체험 종료일, 구독료 변동 알림, 월간 리포트 등 다양한 구독 관리 서비스를 제공할 예정입니다.
      </p>

      <ul className="mt-5 space-y-3 text-sm font-bold text-slate-200">
        <li>✓ 결제 1일 전 알림</li>
        <li>✓ 무료체험 종료 3일 전 알림</li>
        <li>✓ 요금제/가격 변동 알림</li>
        <li>✓ 월간 구독 캘린더</li>
        <li>✓ 월간 구독비 리포트</li>
        <li>✓ 나에게 맞는 최저가 조합 추천</li>
        <li>✓ 구독비 절감 관리</li>
      </ul>
    </div>
  </div>

  <div className="mt-6 rounded-2xl bg-slate-100 p-5">
    <p className="text-sm font-bold leading-6 text-slate-600">
      무료 플랜은 “현재 구독 상태를 확인하는 기능”, 프리미엄 플랜은 “앞으로 결제일과 종료일을 직접 기억하지 않아도 되게 관리해주는 기능”에 집중합니다.
    </p>
  </div>
</div>
<div className="mt-8 rounded-3xl bg-black p-6 text-white">
  <p className="text-sm font-bold text-slate-300">안샘 프리미엄 베타 알림</p>

  <h3 className="mt-2 text-3xl font-black leading-tight">
    구독 결제일과 무료체험 종료일,
    <br />
    이제 직접 기억하지 마세요.
  </h3>

  <p className="mt-4 break-keep leading-7 text-slate-300">
    프리미엄 플랜에서는 결제일, 무료체험 종료일, 구독료 변동 알림과
    월간 리포트 등 다양한 구독 관리 기능을 제공할 예정입니다.
  </p>

  <div className="mt-6 grid gap-3 text-sm font-bold text-slate-200 sm:grid-cols-2">
    <p>✓ 결제 1일 전 알림</p>
    <p>✓ 무료체험 종료 3일 전 알림</p>
    <p>✓ 구독료 변동 알림</p>
    <p>✓ 월간 구독비 리포트</p>
  </div>

  {emailSubmitted ? (
    <div className="mt-6 rounded-2xl bg-white p-5 text-black">
      <p className="text-lg font-black">알림 신청이 완료됐어요.</p>
      <p className="mt-2 break-keep text-sm font-bold text-slate-600">
        {premiumEmail} 주소로 안샘 프리미엄 베타 오픈 소식을 가장 먼저 알려드릴게요.
      </p>
    </div>
  ) : (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={premiumEmail}
          onChange={(event) => {
            setPremiumEmail(event.target.value);
            setEmailError("");
          }}
          placeholder="이메일 주소"
          className="min-w-0 flex-1 rounded-2xl border border-white/20 bg-white px-4 py-3 font-bold text-black outline-none"
        />
        <button
          type="button"
          onClick={handlePremiumSignup}
          className="rounded-2xl bg-white px-6 py-3 font-black text-black"
        >
          프리미엄 알림 받기
        </button>
      </div>

      {emailError ? (
        <p className="mt-3 text-sm font-bold text-red-300">{emailError}</p>
      ) : (
        <p className="mt-3 break-keep text-xs font-bold text-slate-400">
          입력한 이메일은 프리미엄 베타 오픈 알림 용도로만 사용됩니다.
        </p>
      )}
    </div>
  )}
</div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
  setSelectedServices([]);
  setCustomServices([]);
setCustomName("");
setCustomPrice("");
setCustomCategory("OTT");
setCustomError("");
  setBillingDays({});
  setTrialEndDates({});
  setShowResult(false);
  setStarted(false);
  window.localStorage.removeItem("subscriptionDiagnosisState");
}}
                className="rounded-2xl bg-black px-8 py-4 font-bold text-white"
              >
                다시 진단하기
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `내 구독비 진단 결과는 ${result.title}! 월 ${money(
                      analysis.saving
                    )}원, 연간 약 ${money(
                      analysis.yearlySaving
                    )}원을 줄일 수 있대요.`
                  );
                  alert("공유 문구가 복사됐어요.");
                }}
                className="rounded-2xl border border-slate-300 bg-white px-8 py-4 font-bold"
              >
                결과 공유 문구 복사
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-5 py-8 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-bold text-slate-500">STEP 1</p>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">
            매달 자동결제되는 구독 서비스를 선택해주세요.
          </h1>
          <p className="mt-4 text-slate-600">
            카드나 계좌를 연결하지 않아도 괜찮아요. 선택한 서비스의 예상 요금과 사용 패턴을 기준으로 구독비를 진단합니다.
          </p>

          <div className="mt-8 space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="mb-3 text-xl font-black">{category}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {services
                    .filter((service) => service.category === category)
                    .map((service) => {
                      const active = selectedServices.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-black bg-black text-white"
                              : "border-slate-200 bg-white hover:border-slate-400"
                          }`}
                        >
                          <p className="font-black">{service.name}</p>
                          <p
                            className={`mt-1 text-sm ${
                              active ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            월 약 {money(service.price)}원
                          </p>
                          <ServiceBadges service={service} active={active} />
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
<div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
  <p className="text-sm font-black text-slate-500">직접 추가</p>
  <h3 className="mt-2 text-2xl font-black">
    목록에 없는 구독도 추가할 수 있어요.
  </h3>
  <p className="mt-3 break-keep text-sm leading-6 text-slate-500">
    사용 중인 서비스가 목록에 없다면 서비스명과 월 구독료를 직접 입력해주세요.
    추가한 구독도 월 구독비 계산과 진단 결과에 함께 반영됩니다.
  </p>

  <div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_180px_auto]">
    <input
      type="text"
      value={customName}
      onChange={(event) => {
        setCustomName(event.target.value);
        setCustomError("");
      }}
      placeholder="예: 밀리의서재"
      className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-slate-900"
    />

    <input
      type="text"
      value={customPrice}
      onChange={(event) => {
        setCustomPrice(event.target.value);
        setCustomError("");
      }}
      placeholder="월 구독료"
      className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-slate-900"
    />

    <select
      value={customCategory}
      onChange={(event) =>
        setCustomCategory(event.target.value as ServiceCategory)
      }
      className="rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-slate-900"
    >
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>

    <button
      type="button"
      onClick={addCustomService}
      className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white"
    >
      추가
    </button>
  </div>

  {customError ? (
    <p className="mt-3 text-sm font-bold text-red-500">{customError}</p>
  ) : null}

  {customServices.length > 0 ? (
    <div className="mt-5 space-y-3">
      {customServices.map((service) => (
        <div
          key={service.id}
          className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-black">{service.name}</p>
            <p className="text-sm font-bold text-slate-500">
              {service.category} · 월 {money(service.price)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => removeCustomService(service.id)}
            className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-600"
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  ) : null}
</div>
        <div className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-bold text-slate-500">STEP 2</p>
          <h2 className="mt-2 text-3xl font-black">실제로 얼마나 쓰고 있는지 알려주세요.</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Question title="한 달 구독비 예산은 어느 정도가 적당한가요?">
              <Select value={budget} onChange={setBudget}>
                <option value="10000">1만 원 이하</option>
                <option value="30000">3만 원 이하</option>
                <option value="50000">5만 원 이하</option>
                <option value="100000">10만 원 이하</option>
                <option value="150000">10만 원 이상도 괜찮아요</option>
              </Select>
            </Question>

            <Question title="OTT를 일주일에 얼마나 자주 보나요?">
              <Select value={ottUsage} onChange={setOttUsage}>
                <option value="none">거의 안 봐요</option>
                <option value="rare">주 1~2회 정도 봐요</option>
                <option value="weekly">주 3~4회 정도 봐요</option>
                <option value="daily">거의 매일 봐요</option>
                <option value="heavy">매일 2시간 이상 봐요</option>
              </Select>
            </Question>

            <Question title="유튜브를 하루에 얼마나 사용하나요?">
              <Select value={youtubeUsage} onChange={setYoutubeUsage}>
                <option value="none">거의 안 봐요</option>
                <option value="short">하루 30분 이하</option>
                <option value="oneHour">하루 1시간 정도</option>
                <option value="twoHours">하루 2시간 이상</option>
                <option value="always">거의 계속 틀어놓아요</option>
              </Select>
            </Question>

            <Question title="유튜브 광고가 얼마나 불편한가요?">
              <Select value={adStress} onChange={setAdStress}>
                <option value="low">별로 불편하지 않아요</option>
                <option value="medium">조금 불편해요</option>
                <option value="high">많이 불편해요</option>
                <option value="premium">광고 때문에 이미 프리미엄을 써요</option>
              </Select>
            </Question>

            <Question title="영상 편집이나 디자인 작업을 하나요?">
              <Select value={creatorUsage} onChange={setCreatorUsage}>
                <option value="none">거의 안 해요</option>
                <option value="shorts">가끔 쇼츠/릴스만 만들어요</option>
                <option value="sns">SNS 콘텐츠나 썸네일을 자주 만들어요</option>
                <option value="work">업무/홍보용 콘텐츠를 만들어요</option>
                <option value="professional">전문적으로 편집이나 디자인을 해요</option>
              </Select>
            </Question>

            <Question title="AI툴을 얼마나 자주 사용하나요?">
              <Select value={aiUsage} onChange={setAiUsage}>
                <option value="none">거의 사용하지 않아요</option>
                <option value="rare">가끔 궁금한 걸 물어보는 정도예요</option>
                <option value="writing">글쓰기나 문장 정리에 사용해요</option>
                <option value="work">사업/업무/공부에 자주 사용해요</option>
                <option value="daily">코딩, 이미지, 자료조사까지 매일 사용해요</option>
              </Select>
            </Question>

            <Question title="구독을 필요할 때만 해지하고 다시 가입하나요?">
              <Select value={cancelHabit} onChange={setCancelHabit}>
                <option value="often">네, 자주 해지하고 다시 가입해요</option>
                <option value="sometimes">가끔 정리하는 편이에요</option>
                <option value="lazy">귀찮아서 대부분 계속 유지해요</option>
                <option value="miss">무료체험이나 결제일을 자주 놓쳐요</option>
                <option value="unknown">뭐가 나가는지 잘 몰라요</option>
              </Select>
            </Question>
          </div>

          <div className="mt-10 rounded-3xl bg-slate-100 p-6">
            <p className="text-sm font-bold text-slate-500">
              지금 선택한 구독의 예상 월 고정비
            </p>
            <p className="mt-2 text-4xl font-black">{money(monthlyTotal)}원</p>
          </div>
{selected.length > 0 ? (
  <div className="mt-6 rounded-3xl border border-slate-200 p-6">
    <h3 className="text-xl font-black">결제일도 함께 정리해볼까요?</h3>
    <p className="mt-2 text-sm text-slate-500">
      결제일을 알고 있는 서비스만 입력해도 괜찮아요. 결과 화면에서 이번 달 구독 결제 일정을 날짜순으로 정리해드릴게요.
    </p>

    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {selected.map((service) => (
        <label
          key={service.id}
          className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"
        >
          <div>
            <p className="font-black">{service.name}</p>
            <p className="mt-1 text-sm text-slate-500">
              월 약 {money(service.price)}원
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">매월</span>
            <input
              type="number"
              min="1"
              max="31"
              value={billingDays[service.id] ?? ""}
              onChange={(event) =>
                updateBillingDay(service.id, event.target.value)
              }
              placeholder="일"
              className="w-16 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center font-black outline-none"
            />
            <span className="text-sm font-bold text-slate-500">일</span>
          </div>
        </label>
      ))}
    </div>
  </div>
) : null}
{selected.filter((service) => service.freeTrialDays).length > 0 ? (
  <div className="mt-6 rounded-3xl border border-slate-200 p-6">
    <h3 className="text-xl font-black">무료체험 종료일도 놓치지 마세요.</h3>
    <p className="mt-2 text-sm text-slate-500">
      무료체험이 끝나고 자동결제되는 경우가 많아요. 종료일을 입력하면 결과 화면에서 미리 확인할 수 있게 정리해드릴게요.
    </p>

    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {selected
        .filter((service) => service.freeTrialDays)
        .map((service) => (
          <label
            key={service.id}
            className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4"
          >
            <div>
              <p className="font-black">{service.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                무료체험 {service.freeTrialDays}일 제공 가능
              </p>
            </div>

            <input
              type="date"
              value={trialEndDates[service.id] ?? ""}
              onChange={(event) =>
                updateTrialEndDate(service.id, event.target.value)
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold outline-none"
            />
          </label>
        ))}
    </div>
  </div>
) : null}
          <button
            onClick={() => setShowResult(true)}
            className="mt-8 w-full rounded-2xl bg-black px-8 py-5 text-lg font-black text-white shadow-lg transition hover:scale-[1.01]"
          >
            결과 확인하기
          </button>
        </div>
      </section>
    </main>
  );
}

function Question({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-3xl border border-slate-200 p-5">
      <p className="mb-3 font-black">{title}</p>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold outline-none"
    >
      {children}
    </select>
  );
}
function ServiceBadges({
  service,
  active,
}: {
  service: {
    freeTrialDays?: number;
    hasFreePlan?: boolean;
    hasAdPlan?: boolean;
    discountMethods?: string[];
  };
  active: boolean;
}) {
  const badges = [];

  if (service.freeTrialDays) {
    badges.push(`무료체험 ${service.freeTrialDays}일`);
  }

  if (service.hasFreePlan) {
    badges.push("무료 플랜");
  }

  if (service.hasAdPlan) {
    badges.push("광고형 요금제");
  }

  if (service.discountMethods && service.discountMethods.length > 0) {
    badges.push("할인 가능");
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {badges.slice(0, 3).map((badge) => (
        <span
          key={badge}
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            active
              ? "bg-white/15 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {badge}
        </span>
      ))}
    </div>
  );
}