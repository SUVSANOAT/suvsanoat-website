import type { SolutionContentSet } from "../types";

/**
 * Посадочная под запросы «очистные для пищевого производства /
 * молокозавода / мясокомбината». Ведёт на ЖИР, РЕЗ, БИО.
 */

const content: SolutionContentSet = {
  ru: {
    label: "ПИЩЕВЫЕ ПРОИЗВОДСТВА",
    title: "Очистные для пищевого\nпроизводства: по нагрузке, не по расходу.",
    intro:
      "Молокозавод, мясопереработка, кондитерский цех, напитки — у каждого свой сток, и обычная «коммунальная» схема здесь не работает. Разбираем, почему пищевой сток считается по ХПК и жирам, из чего складывается схема и что мы производим для неё сами.",
    sections: [
      {
        title: "Почему пищевой сток — отдельная задача",
        text: [
          "Коммунальный сток — это ХПК 400–700 мг/л. Молокозавод даёт 3 000–6 000, сыроварня — до 20 000 при сливе сыворотки, мясопереработка — 2 000–5 000 с жирами до 1 500 мг/л. Схема, посчитанная «по кубометрам» без анализа стока, на таких концентрациях не работает — она захлёбывается в первую же смену.",
          "Вторая особенность — залповость. Мойка танков и полов идёт два-три раза в сутки короткими сбросами с моющими растворами: то кислота, то щёлочь, то горячая вода с жиром. Без усреднителя с запасом на залп любая биология погибает от скачков pH и температуры.",
          "Поэтому подбор начинается не с прайса, а с анкеты: продукт, объём переработки, режим моек, точки слива. По ним считается баланс загрязнений — и только из него следует схема.",
        ],
      },
      {
        title: "Схема и что в ней наше",
        text: [
          "Типовая цепочка пищевого производства: жироотделение на горячих выпусках → усреднение с коррекцией pH → физико-химическая ступень (флотация) для снятия жира и взвеси → биологическая очистка → сброс в коллектор или доочистка до норматива.",
          "Наше производство закрывает корпусную часть цепочки: жироуловители до 50 м³/ч, усреднители до 500 м³ батареями, станции дозирования реагентов до 10 000 л, биологические модули до 500 м³/сут. Флотатор и обезвоживание осадка — покупные узлы, которые мы включаем в схему открыто, с паспортами поставщика.",
          "Для проектировщика выдаём полный комплект: технологический расчёт по балансу масс, компоновку, спецификацию с разделением «производим / поставляем». Для действующих производств начинаем с суточного отбора проб — измеренный сток надёжнее любых справочных цифр.",
        ],
      },
    ],
    pickTitle: "Оборудование из нашего ассортимента",
    pickText:
      "Это корпусная часть схемы, которую мы производим сами. Флотация и обезвоживание подбираются проектно, по балансу загрязнений вашего стока.",
    picks: [
      { slug: "zhir-12", when: "Жироотделение цеха переработки" },
      { slug: "zhir-30", when: "Горячие выпуски крупного цеха" },
      { slug: "rez-50", when: "Усреднитель со срезкой залпов" },
      { slug: "rez-150", when: "Усреднение суточного стока завода" },
      { slug: "doz-1000", when: "Коррекция pH, коагулянт" },
      { slug: "bio-200", when: "Биологическая ступень, 6 корпусов" },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Водоканал грозит штрафами за превышение. С чего начать?",
        a: "С суточного отбора проб по часам: без него любая схема — гадание. Замер покажет, что именно превышено и когда. Часто половина проблемы решается организационно — отделением сыворотки или крови в отдельный сбор — ещё до строительства очистных. Это мы тоже показываем в отчёте.",
      },
      {
        q: "Можно ли обойтись только жироуловителем?",
        a: "Для маленького цеха при умеренных концентрациях — иногда да, и тогда мы так и скажем. Но жироуловитель снимает только свободный жир и взвесь; растворённую органику (ХПК) он не трогает. Если норматив по БПК/ХПК превышен — без биологии или флотации не обойтись, и обещать обратное было бы обманом.",
      },
      {
        q: "Сыворотку можно сливать в очистные?",
        a: "Нельзя — и это самая дорогая ошибка молокозаводов. ХПК сыворотки — до 60 000 мг/л: один слив танка равен суточной нагрузке посёлка. Сыворотка собирается отдельно и продаётся или вывозится; очистные считаются на сток БЕЗ неё. Это условие мы фиксируем в исходных данных.",
      },
      {
        q: "Сколько места нужно на площадке?",
        a: "Ориентир для производства 200 м³/сут — площадка 15 × 30 м с проездом для откачки осадка. Модули заглубляются, над ними — только технический павильон воздуходувок и реагентов. Точную компоновку выдаём под ваш генплан.",
      },
      {
        q: "Работаете ли с действующим производством без остановки?",
        a: "Да, схема монтируется параллельно существующему выпуску и переключается за одну ночную смену. Для этого при обследовании фиксируем все точки слива и резервные врезки.",
      },
    ],
    allTitle: "ВЕСЬ АССОРТИМЕНТ",
    allButton: "СМОТРЕТЬ ЛИНЕЙКИ",
    allHref: "/products",
    ctaTitle: "Пришлите продукт\nи объём переработки.",
    ctaText:
      "Что производите, сколько тонн в сутки, режим моек и куда сброс. Вернём предварительный баланс загрязнений, схему и состав оборудования с разделением «производим / поставляем».",
    ctaButton: "ПОЛУЧИТЬ СХЕМУ",
  },

  uz: {
    label: "OZIQ-OVQAT ISHLAB CHIQARISHLARI",
    title: "Oziq-ovqat korxonasi uchun tozalash:\nsarf bo‘yicha emas, yuklama bo‘yicha.",
    intro:
      "Sut zavodi, go‘sht qayta ishlash, qandolat sexi, ichimliklar — har birining o‘z oqavasi bor va oddiy «kommunal» sxema bu yerda ishlamaydi. Nega oziq-ovqat oqavasi KXE va yog‘lar bo‘yicha hisoblanadi va sxema nimadan iborat.",
    sections: [
      {
        title: "Nega oziq-ovqat oqavasi alohida masala",
        text: [
          "Kommunal oqava — bu KXE 400–700 mg/l. Sut zavodi 3 000–6 000 beradi, pishloqxona zardob tashlaganda 20 000 gacha, go‘sht qayta ishlash — yog‘lari 1 500 mg/l gacha bo‘lgan 2 000–5 000. Oqava tahlilisiz «kubometr bo‘yicha» hisoblangan sxema bunday konsentratsiyalarda ishlamaydi.",
          "Ikkinchi xususiyat — to‘satdanlik. Tank va pollarni yuvish sutkasiga ikki-uch marta yuvish eritmalari bilan qisqa tashlamalar bilan boradi: goh kislota, goh ishqor, goh yog‘li issiq suv. Zaxirali tenglashtirgichsiz har qanday biologiya pH va harorat sakrashlaridan nobud bo‘ladi.",
          "Shuning uchun tanlov narxdan emas, anketadan boshlanadi: mahsulot, qayta ishlash hajmi, yuvish rejimi, tashlash nuqtalari. Ular bo‘yicha ifloslanish balansi hisoblanadi — sxema faqat undan kelib chiqadi.",
        ],
      },
      {
        title: "Sxema va undagi biznikilar",
        text: [
          "Tipik zanjir: issiq chiqishlarda yog‘ ajratish → pH korreksiyali tenglashtirish → yog‘ va muallaq zarralarni olish uchun fizik-kimyoviy bosqich (flotatsiya) → biologik tozalash → kollektorga tashlash yoki me’yorgacha qo‘shimcha tozalash.",
          "Bizning ishlab chiqarish zanjirning korpus qismini yopadi: 50 m³/soatgacha yog‘ tutgichlar, batareyalarda 500 m³ gacha tenglashtirgichlar, 10 000 l gacha dozalash stansiyalari, 500 m³/sut gacha biologik modullar. Flotator va cho‘kma suvsizlantirish — sotib olinadigan uzellar, ularni sxemaga ochiq, yetkazib beruvchi pasportlari bilan kiritamiz.",
          "Loyihachiga to‘liq komplekt beramiz: massa balansi bo‘yicha texnologik hisob, komponovka, «ishlab chiqaramiz / yetkazamiz» bo‘linishli spetsifikatsiya.",
        ],
      },
    ],
    pickTitle: "Assortimentimizdan uskunalar",
    pickText:
      "Bu biz o‘zimiz ishlab chiqaradigan korpus qismi. Flotatsiya va suvsizlantirish oqavangiz balansi bo‘yicha loyihaviy tanlanadi.",
    picks: [
      { slug: "zhir-12", when: "Qayta ishlash sexining yog‘ ajratgichi" },
      { slug: "zhir-30", when: "Yirik sexning issiq chiqishlari" },
      { slug: "rez-50", when: "To‘satdan tashlamalarni kesuvchi tenglashtirgich" },
      { slug: "rez-150", when: "Zavod sutkalik oqavasini tenglashtirish" },
      { slug: "doz-1000", when: "pH korreksiyasi, koagulyant" },
      { slug: "bio-200", when: "Biologik bosqich, 6 korpus" },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Suv kanali jarima bilan qo‘rqitmoqda. Nimadan boshlash kerak?",
        a: "Soatlab sutkalik namuna olishdan: usiz har qanday sxema — taxmin. O‘lchov aynan nima va qachon oshganini ko‘rsatadi. Ko‘pincha muammoning yarmi tashkiliy hal bo‘ladi — zardob yoki qonni alohida yig‘ishga ajratish bilan.",
      },
      {
        q: "Faqat yog‘ tutgich bilan cheklansa bo‘ladimi?",
        a: "Kichik sex uchun o‘rtacha konsentratsiyalarda — ba’zan ha, unda shunday deymiz ham. Lekin yog‘ tutgich faqat erkin yog‘ va muallaq zarralarni oladi; erigan organikaga (KXE) tegmaydi. BPK/KXE me’yori oshgan bo‘lsa — biologiya yoki flotatsiyasiz bo‘lmaydi.",
      },
      {
        q: "Zardobni tozalash inshootiga tashlash mumkinmi?",
        a: "Mumkin emas — bu sut zavodlarining eng qimmat xatosi. Zardob KXEsi 60 000 mg/l gacha: bitta tank tashlash qishloqning sutkalik yuklamasiga teng. Zardob alohida yig‘iladi va sotiladi yoki olib ketiladi; inshootlar USIZ hisoblanadi.",
      },
      {
        q: "Maydonchada qancha joy kerak?",
        a: "200 m³/sut ishlab chiqarish uchun mo‘ljal — cho‘kma so‘rib olish yo‘lagi bilan 15 × 30 m maydoncha. Modullar ko‘miladi, ustida faqat havo puflagich va reagentlar pavilyoni.",
      },
      {
        q: "Ishlab turgan korxona bilan to‘xtatmasdan ishlaysizlarmi?",
        a: "Ha, sxema mavjud chiqishga parallel montaj qilinadi va bitta tungi smenada ulanadi.",
      },
    ],
    allTitle: "BUTUN ASSORTIMENT",
    allButton: "LINIYALARNI KO‘RISH",
    allHref: "/products",
    ctaTitle: "Mahsulot va qayta ishlash\nhajmini yuboring.",
    ctaText:
      "Nima ishlab chiqarasiz, sutkasiga necha tonna, yuvish rejimi va tashlash qayerga. Dastlabki ifloslanish balansi, sxema va «ishlab chiqaramiz / yetkazamiz» bo‘linishli uskunalar tarkibini qaytaramiz.",
    ctaButton: "SXEMANI OLISH",
  },

  en: {
    label: "FOOD INDUSTRY",
    title: "Food plant effluent:\nsized by load, not by flow.",
    intro:
      "A dairy, a meat processor, a confectionery, a beverage line — each has its own effluent, and the usual municipal scheme does not work here. Why food effluent is designed by COD and fats, what the treatment train looks like, and which parts of it we manufacture.",
    sections: [
      {
        title: "Why food effluent is a separate problem",
        text: [
          "Municipal sewage runs at COD 400–700 mg/l. A dairy produces 3,000–6,000; a cheese plant up to 20,000 when whey is dumped; meat processing 2,000–5,000 with fats up to 1,500 mg/l. A scheme sized by cubic metres without an effluent analysis simply drowns in its first shift.",
          "The second feature is slugs. Tank and floor washing runs two-three times a day in short discharges of cleaning solutions — acid, then caustic, then hot fatty water. Without a balancing tank sized for the slug, any biology dies of pH and temperature swings.",
          "So the selection starts with a questionnaire, not a price list: the product, the throughput, the washing regime, the discharge points. From these the pollution balance is calculated — and only from that, the scheme.",
        ],
      },
      {
        title: "The train, and what in it is ours",
        text: [
          "The typical food-plant train: grease removal on hot outlets → balancing with pH correction → a physico-chemical stage (flotation) for fat and solids → biological treatment → discharge or polishing to the limit.",
          "Our own manufacturing covers the shell part of the train: grease traps to 50 m³/h, balancing tanks to 500 m³ in batteries, dosing stations to 10,000 l, biological modules to 500 m³/day. The flotation unit and sludge dewatering are bought-in items, included in the scheme openly with the supplier's datasheets.",
          "Designers receive the full package: the mass-balance calculation, the layout, and a specification split into 'we make / we supply'. For operating plants we start with a 24-hour sampling campaign — measured effluent beats any reference figures.",
        ],
      },
    ],
    pickTitle: "Equipment from our range",
    pickText:
      "This is the shell part of the train that we manufacture ourselves. Flotation and dewatering are selected per project, from your effluent balance.",
    picks: [
      { slug: "zhir-12", when: "Grease removal for a processing shop" },
      { slug: "zhir-30", when: "Hot outlets of a large shop" },
      { slug: "rez-50", when: "Balancing tank absorbing slugs" },
      { slug: "rez-150", when: "Daily balancing of a plant" },
      { slug: "doz-1000", when: "pH correction, coagulant" },
      { slug: "bio-200", when: "Biological stage, 6 shells" },
    ],
    faqTitle: "Frequent questions",
    faq: [
      {
        q: "The utility threatens fines. Where do we start?",
        a: "With a 24-hour hourly sampling campaign — without it any scheme is guesswork. The survey shows what exactly exceeds and when. Half the problem often resolves organisationally — separating whey or blood into dedicated collection — before anything is built.",
      },
      {
        q: "Can a grease trap alone be enough?",
        a: "For a small shop at moderate strength — sometimes yes, and then we say so. But a trap removes only free fat and solids; dissolved organics (COD) pass through. Where BOD/COD exceeds the limit, biology or flotation is unavoidable, and promising otherwise would be dishonest.",
      },
      {
        q: "Can whey go to the treatment plant?",
        a: "No — and it is the dairy industry's most expensive mistake. Whey COD reaches 60,000 mg/l: one tank dumped equals a settlement's daily load. Whey is collected separately and sold or hauled away; the plant is sized for effluent WITHOUT it.",
      },
      {
        q: "How much site area is needed?",
        a: "A guide for 200 m³/day is a 15 × 30 m plot with truck access for sludge removal. The modules are buried; above them only a pavilion for blowers and chemicals.",
      },
      {
        q: "Can you work on an operating plant without a shutdown?",
        a: "Yes — the train is erected parallel to the existing outlet and switched over in one night shift. The survey records all discharge points and standby tie-ins for that.",
      },
    ],
    allTitle: "FULL RANGE",
    allButton: "VIEW THE LINES",
    allHref: "/products",
    ctaTitle: "Send the product\nand the throughput.",
    ctaText:
      "What you make, tonnes per day, the washing regime and where the discharge goes. We return a preliminary pollution balance, the scheme and the equipment list split into 'we make / we supply'.",
    ctaButton: "GET THE SCHEME",
  },

  zh: {
    label: "食品工业",
    title: "食品厂污水处理：\n按负荷而非流量设计。",
    intro:
      "乳品厂、肉类加工、糖果车间、饮料线——各有各的污水，常规'市政'方案在这里行不通。为什么食品污水按 COD 和油脂设计、处理流程由什么组成、其中哪些由我们制造。",
    sections: [
      {
        title: "为什么食品污水是单独的课题",
        text: [
          "市政污水 COD 为 400–700 mg/l。乳品厂产生 3 000–6 000；奶酪厂排放乳清时高达 20 000；肉类加工 2 000–5 000，油脂高至 1 500 mg/l。不做水质分析、按立方米算出的方案在这种浓度下第一班就会瘫痪。",
          "第二个特点是冲击性排放。罐体和地面清洗每天两三次，短时排放清洗液——一会儿酸、一会儿碱、一会儿含油热水。没有按冲击量设计的调节池，任何生物系统都会死于 pH 和温度的跳变。",
          "因此选型从问卷开始而不是从报价开始：产品、加工量、清洗制度、排放点。据此计算污染物平衡——方案只能由它得出。",
        ],
      },
      {
        title: "处理流程与我们制造的部分",
        text: [
          "典型流程：热排口隔油 → 带 pH 调节的水量水质调节 → 物化段（气浮）去除油脂与悬浮物 → 生物处理 → 排入管网或深度处理达标。",
          "我们的制造覆盖流程的壳体部分：50 m³/h 以内隔油器、罐组至 500 m³ 的调节池、10 000 升以内加药装置、500 m³/d 以内生物模块。气浮机和污泥脱水为外购件，公开列入方案并附供应商文件。",
          "给设计院的完整资料：物料平衡计算、布置图、'自产/外购'分列的设备表。对在产企业先做 24 小时逐时采样——实测数据胜过任何手册数字。",
        ],
      },
    ],
    pickTitle: "本厂系列中的设备",
    pickText: "这是我们自产的壳体部分。气浮与脱水按项目、按您污水的物料平衡选型。",
    picks: [
      { slug: "zhir-12", when: "加工车间隔油" },
      { slug: "zhir-30", when: "大型车间热排口" },
      { slug: "rez-50", when: "削减冲击的调节池" },
      { slug: "rez-150", when: "工厂昼夜调节" },
      { slug: "doz-1000", when: "pH 调节、混凝剂" },
      { slug: "bio-200", when: "生物段，6 壳体" },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "自来水公司威胁罚款，从哪里开始？",
        a: "从 24 小时逐时采样开始——没有它任何方案都是猜测。检测会显示到底什么超标、何时超标。一半问题往往靠管理解决——把乳清或血水分流单独收集——根本无需建设。",
      },
      {
        q: "只装隔油器行不行？",
        a: "小车间、浓度不高时——有时行，那我们就直说。但隔油器只去除游离油脂和悬浮物；溶解性有机物（COD）原样通过。BOD/COD 超标时，生物或气浮不可回避，承诺相反就是欺骗。",
      },
      {
        q: "乳清能排入处理设施吗？",
        a: "不能——这是乳品行业最昂贵的错误。乳清 COD 高达 60 000 mg/l：倒一罐等于一个村镇一天的负荷。乳清单独收集出售或外运；设施按'不含乳清'的污水设计。",
      },
      {
        q: "场地需要多大？",
        a: "200 m³/d 规模的参考值：15 × 30 m，留吸污车通道。模块埋地，地面只有鼓风机与药剂间。",
      },
      {
        q: "在产企业能不停产施工吗？",
        a: "能——处理线与现有排口平行建设，一个夜班完成切换。为此勘察时记录全部排放点和备用接口。",
      },
    ],
    allTitle: "全部系列",
    allButton: "查看产品线",
    allHref: "/products",
    ctaTitle: "发来产品\n和加工量。",
    ctaText: "生产什么、每天多少吨、清洗制度、排向哪里。我们将返回初步污染物平衡、方案和'自产/外购'分列的设备构成。",
    ctaButton: "获取方案",
  },
};

export default content;
