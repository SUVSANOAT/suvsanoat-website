export type Language = "ru" | "uz" | "en";

export const translations = {
  ru: {
    language: "RU",

    nav: {
      catalog: "Каталог",
      solutions: "Решения",
      technologies: "Технологии",
      projects: "Проекты",
      services: "Услуги",
      contacts: "Контакты",
      calculation: "Получить расчёт",
      menu: "МЕНЮ",
      closeMenu: "Закрыть меню",
    },

    hero: {
      slides: [
        {
          label: "ИНЖЕНЕРНЫЕ СИСТЕМЫ ВОДООЧИСТКИ",
          title: "Чистая вода.\nТочные решения.",
          text: "Проектирование, производство и поставка оборудования для очистки сточных вод и водоподготовки.",
        },
        {
          label: "ПРОМЫШЛЕННЫЕ ОЧИСТНЫЕ СООРУЖЕНИЯ",
          title: "От проекта\nдо запуска.",
          text: "Комплексные очистные сооружения для промышленных, коммерческих и инфраструктурных объектов.",
        },
        {
          label: "ДЕЗИНФЕКЦИЯ И ДОЗИРОВАНИЕ",
          title: "Точный контроль.\nНадёжная вода.",
          text: "Хлораторные установки, системы дозирования и автоматическое оборудование для обеззараживания воды.",
        },
      ],
      catalogButton: "Смотреть каталог",
      calculationButton: "Получить расчёт",
      slide: "Слайд",
    },

    categories: [
      "Очистные сооружения",
      "Водоподготовка",
      "Механическая очистка",
      "Насосное оборудование",
      "Дезинфекция и дозирование",
      "Обработка осадка",
      "Аэрационное оборудование",
      "Резервуары и ёмкости",
      "Автоматизация",
      "Арматура и трубопроводы",
      "Технологии очистки",
      "Комплексные решения",
    ],

    stats: [
      {
        strong: "5–200 000",
        label: "м³/сутки · ЛЮБОЙ МАСШТАБ",
        text: "От локальных установок до крупных промышленных очистных комплексов",
      },
      {
        strong: "ПОД КЛЮЧ",
        label: "ПОЛНЫЙ ЦИКЛ",
        text: "Проектирование, производство, поставка, монтаж и запуск",
      },
      {
        strong: "ПОД ВАШ ОБЪЕКТ",
        label: "ИНДИВИДУАЛЬНО",
        text: "Технология и оборудование под требования конкретного проекта",
      },
      {
        strong: "СЕРВИС",
        label: "ПОСЛЕ ЗАПУСКА",
        text: "Техническое сопровождение, обслуживание и запасные части",
      },
    ],

    catalog: {
      label: "КАТАЛОГ SUVSANOAT",
      title: "Всё для воды.\nВ одной системе.",
      text: "Комплексное оборудование для очистки сточных вод, водоподготовки, насосных систем, автоматизации и промышленной инфраструктуры.",
    },

    technologies: {
      label: "ТЕХНОЛОГИИ SUVSANOAT",
      title: "Не одна технология.\nПравильная технология.",
      text: "Подбираем технологическую схему на основании состава сточных вод, производительности, требований к качеству очищенной воды и условий эксплуатации объекта.",

      cards: [
        {
          code: "MBR",
          title: "Мембранный биореактор",
          text: "Высокая степень очистки и компактное размещение очистных сооружений.",
        },
        {
          code: "SBR",
          title: "Последовательная очистка",
          text: "Гибкая биологическая технология для коммунальных и промышленных стоков.",
        },
        {
          code: "MBBR",
          title: "Биоплёночная технология",
          text: "Устойчивая работа при изменяющейся органической нагрузке.",
        },
        {
          code: "RO / UF",
          title: "Мембранная водоподготовка",
          text: "Доочистка, водоподготовка и повторное использование воды.",
        },
      ],
    },

    solutions: {
      label: "РЕШЕНИЯ ПО ОТРАСЛЯМ",
      title: "Решение начинается\nс вашего объекта.",
      text: "Проектируем системы с учётом состава сточных вод, режима работы предприятия и требований к качеству очищенной воды.",

      industries: [
        "Текстильные предприятия",
        "Пищевые производства",
        "Молочные предприятия",
        "Мясокомбинаты",
        "Птицефабрики",
        "Гостиницы и больницы",
        "Жилые комплексы",
        "Аэропорты",
      ],
    },

    services: {
      label: "ПОЛНЫЙ ЦИКЛ РАБОТ",
      title: "Один подрядчик.\nВесь цикл проекта.",
      text: "От анализа исходных данных и разработки технологической схемы до поставки оборудования, запуска объекта и дальнейшего сервисного обслуживания.",

      steps: [
        {
          title: "Анализ",
          text: "Изучение исходных данных, состава воды и требований объекта.",
        },
        {
          title: "Проектирование",
          text: "Подбор технологии и разработка инженерного решения.",
        },
        {
          title: "Производство",
          text: "Изготовление и комплектация технологического оборудования.",
        },
        {
          title: "Поставка",
          text: "Организация поставки оборудования непосредственно на объект.",
        },
        {
          title: "Монтаж",
          text: "Монтаж оборудования и шеф-монтаж инженерных систем.",
        },
        {
          title: "Пусконаладка",
          text: "Запуск системы, настройка процессов и обучение персонала.",
        },
        {
          title: "Сервис",
          text: "Техническое обслуживание, диагностика и запасные части.",
        },
      ],

      bottomLabel: "НАЧАТЬ ПРОЕКТ",
      bottomTitle: "Есть техническое задание\nили исходные данные?",
      bottomText:
        "Отправьте ТЗ, анализы воды или сточных вод, производительность и требования к объекту. Подготовим предварительное техническое решение.",
      bottomButton: "Отправить техническое задание",
    },

    contacts: {
      label: "КОНТАКТЫ",
      title: "Обсудим\nваш проект.",
      intro:
        "Нужна очистка сточных вод, водоподготовка или подбор оборудования? Отправьте исходные данные — подготовим предварительное техническое решение.",

      phone: "ТЕЛЕФОН / TELEGRAM",
      email: "E-MAIL",
      workRegion: "РЕГИОН РАБОТЫ",
      directions: "НАПРАВЛЕНИЯ",

      regions: ["Узбекистан", "Страны СНГ", "Международные проекты"],

      directionItems: [
        "Очистные сооружения",
        "Водоподготовка",
        "Промышленное оборудование",
        "Инжиниринг",
      ],

      requirementsTitle: "ДЛЯ ПРЕДВАРИТЕЛЬНОГО РАСЧЁТА ДОСТАТОЧНО",

      requirements: [
        "Тип объекта",
        "Производительность, м³/сутки",
        "Анализы воды или сточных вод",
        "Требования к очищенной воде",
      ],

      formLabel: "ОТПРАВИТЬ ЗАЯВКУ",
      formTitle: "Получите предварительное\nтехническое решение.",
      formText:
        "Заполните основные данные об объекте. Наш специалист изучит информацию и свяжется с вами.",

      nameLabel: "ИМЯ / КОМПАНИЯ *",
      namePlaceholder: "Ваше имя или компания",

      phoneLabel: "ТЕЛЕФОН / TELEGRAM *",

      objectLabel: "ТИП ОБЪЕКТА",
      objectPlaceholder: "Выберите объект",

      objectTypes: {
        industrial: "Промышленное предприятие",
        textile: "Текстильное предприятие",
        food: "Пищевое производство",
        residential: "Жилой комплекс",
        hotel: "Гостиница",
        hospital: "Больница",
        airport: "Аэропорт",
        water: "Водоподготовка",
        other: "Другой объект",
      },

      capacityLabel: "ПРОИЗВОДИТЕЛЬНОСТЬ",
      capacityPlaceholder: "Например: 1500 м³/сутки",

      messageLabel: "КОММЕНТАРИЙ / ОПИСАНИЕ ЗАДАЧИ",
      messagePlaceholder:
        "Кратко опишите задачу, требования или имеющиеся исходные данные...",

      canPrepare: "МОЖНО ПОДГОТОВИТЬ",
      canPrepareText:
        "Техническое задание · Анализы воды/стоков · Чертежи · Требования к качеству воды",

      submit: "ОТПРАВИТЬ ЗАЯВКУ",
      submitting: "ОТПРАВЛЯЕМ...",

      privacy:
        "Нажимая кнопку, вы соглашаетесь на обработку предоставленных данных.",

      successLabel: "ЗАЯВКА ОТПРАВЛЕНА",
      successTitle: "Спасибо за обращение.",
      successText:
        "Ваша заявка успешно отправлена. Наш специалист изучит информацию и свяжется с вами.",
      sendAgain: "Отправить ещё одну заявку",

      error: "Не удалось отправить заявку. Попробуйте ещё раз.",
    },

    mega: {
      industry: "ПРОМЫШЛЕННОСТЬ",
      infrastructure: "ИНФРАСТРУКТУРА",
      residential: "ЖИЛЫЕ ОБЪЕКТЫ",
      special: "СПЕЦИАЛЬНЫЕ РЕШЕНИЯ",

      textile: "Текстильные предприятия",
      food: "Пищевые производства",
      dairy: "Молочные предприятия",
      meat: "Мясокомбинаты",
      poultry: "Птицефабрики",

      airports: "Аэропорты",
      hotels: "Гостиницы",
      hospitals: "Больницы",
      shopping: "Торговые центры",
      business: "Бизнес-центры",

      residentialComplex: "Жилые комплексы",
      cottage: "Коттеджные поселки",
      privateObjects: "Частные объекты",
      commercialObjects: "Коммерческие объекты",

      reuse: "Повторное использование воды",
      industrialWastewater: "Сложные промышленные стоки",
      modernization: "Модернизация существующих КОС",
      individualDesign: "Индивидуальное проектирование",

      individualLabel: "ИНДИВИДУАЛЬНОЕ РЕШЕНИЕ",
      individualTitle: "Не нашли\nсвою отрасль?",
      individualText:
        "Разработаем технологическое решение под состав сточных вод, производительность и требования вашего объекта.",
      individualButton: "Получить решение",

      biological: "БИОЛОГИЧЕСКАЯ ОЧИСТКА",
      membrane: "МЕМБРАННЫЕ ТЕХНОЛОГИИ",
      physicalChemical: "ФИЗИКО-ХИМИЧЕСКАЯ ОЧИСТКА",
      disinfection: "ОБЕЗЗАРАЖИВАНИЕ",

      engineeringSelection: "ИНЖЕНЕРНЫЙ ПОДБОР",
      technologyQuestion: "Какая технология\nнужна вашему объекту?",
      technologyText:
        "Анализируем состав сточных вод, производительность и требования к качеству очищенной воды.",
      technologiesCount: "технологий",
      selectTechnology: "Подобрать технологию",

      engineering: "ИНЖИНИРИНГ",
      implementation: "РЕАЛИЗАЦИЯ",
      afterLaunch: "ПОСЛЕ ЗАПУСКА",

      sourceAnalysis: "Анализ исходных данных",
      technologySelection: "Подбор технологии",
      calculation: "Технологический расчёт",
      design: "Проектирование",
      specification: "Подготовка спецификации",

      production: "Производство оборудования",
      delivery: "Поставка оборудования",
      installation: "Монтаж",
      supervision: "Шеф-монтаж",
      commissioning: "Пусконаладочные работы",

      warranty: "Гарантийное обслуживание",
      maintenance: "Сервисное обслуживание",
      diagnostics: "Диагностика оборудования",
      spareParts: "Поставка запасных частей",
      modernizationSystems: "Модернизация систем",

      haveSpecification: "ЕСТЬ ТЕХНИЧЕСКОЕ ЗАДАНИЕ?",
      sendSpecificationTitle: "Отправьте ТЗ —\nподготовим решение.",
      sendSpecificationText:
        "Изучим исходные данные, подберём технологию и оборудование, подготовим предварительное техническое предложение.",
      sendSpecification: "Отправить техническое задание",
    },

    footer: {
      description: "Инженерные системы очистки воды\nи сточных вод.",
      navigation: "НАВИГАЦИЯ",
      contact: "СВЯЗАТЬСЯ",
      copyright: "© 2026 SUVSANOAT. Все права защищены.",
      slogan: "WATER · WASTEWATER · ENGINEERING",
    },

    floating: {
      write: "НАПИСАТЬ",
      call: "ПОЗВОНИТЬ",
      top: "НАВЕРХ",
    },
  },

  uz: {
    language: "UZ",

    nav: {
      catalog: "Katalog",
      solutions: "Yechimlar",
      technologies: "Texnologiyalar",
      projects: "Loyihalar",
      services: "Xizmatlar",
      contacts: "Aloqa",
      calculation: "Hisob-kitob olish",
      menu: "MENYU",
      closeMenu: "Menyuni yopish",
    },

    hero: {
      slides: [
        {
          label: "SUV TOZALASH MUHANDISLIK TIZIMLARI",
          title: "Toza suv.\nAniq yechimlar.",
          text: "Oqova suvlarni tozalash va suv tayyorlash uskunalarini loyihalash, ishlab chiqarish va yetkazib berish.",
        },
        {
          label: "SANOAT OQOVA SUV TOZALASH INSHOOTLARI",
          title: "Loyihadan\nishga tushirishgacha.",
          text: "Sanoat, tijorat va infratuzilma obyektlari uchun kompleks oqova suv tozalash inshootlari.",
        },
        {
          label: "DEZINFEKSIYA VA DOZALASH",
          title: "Aniq nazorat.\nIshonchli suv.",
          text: "Suvni zararsizlantirish uchun xlorlash qurilmalari, dozalash tizimlari va avtomatik uskunalar.",
        },
      ],
      catalogButton: "Katalogni ko‘rish",
      calculationButton: "Hisob-kitob olish",
      slide: "Slayd",
    },

    categories: [
      "Oqova suv tozalash inshootlari",
      "Suv tayyorlash",
      "Mexanik tozalash",
      "Nasos uskunalari",
      "Dezinfeksiya va dozalash",
      "Cho‘kmani qayta ishlash",
      "Aeratsiya uskunalari",
      "Rezervuarlar va sig‘imlar",
      "Avtomatlashtirish",
      "Armatura va quvurlar",
      "Tozalash texnologiyalari",
      "Kompleks yechimlar",
    ],

    stats: [
      {
        strong: "5–200 000",
        label: "m³/kun · HAR QANDAY KO‘LAM",
        text: "Mahalliy qurilmalardan yirik sanoat tozalash komplekslarigacha",
      },
      {
        strong: "TAYYOR HOLDA",
        label: "TO‘LIQ SIKL",
        text: "Loyihalash, ishlab chiqarish, yetkazib berish, montaj va ishga tushirish",
      },
      {
        strong: "SIZNING OBYEKTINGIZ UCHUN",
        label: "INDIVIDUAL",
        text: "Muayyan loyiha talablariga mos texnologiya va uskunalar",
      },
      {
        strong: "SERVIS",
        label: "ISHGA TUSHIRISHDAN KEYIN",
        text: "Texnik qo‘llab-quvvatlash, xizmat ko‘rsatish va ehtiyot qismlar",
      },
    ],

    catalog: {
      label: "SUVSANOAT KATALOGI",
      title: "Suv uchun hammasi.\nBitta tizimda.",
      text: "Oqova suvlarni tozalash, suv tayyorlash, nasos tizimlari, avtomatlashtirish va sanoat infratuzilmasi uchun kompleks uskunalar.",
    },

    technologies: {
      label: "SUVSANOAT TEXNOLOGIYALARI",
      title: "Shunchaki texnologiya emas.\nTo‘g‘ri texnologiya.",
      text: "Texnologik sxemani oqova suv tarkibi, unumdorlik, tozalangan suv sifatiga qo‘yiladigan talablar va obyektning ekspluatatsiya sharoitlari asosida tanlaymiz.",

      cards: [
        {
          code: "MBR",
          title: "Membranali bioreaktor",
          text: "Yuqori tozalash darajasi va tozalash inshootlarini ixcham joylashtirish.",
        },
        {
          code: "SBR",
          title: "Ketma-ket biologik tozalash",
          text: "Kommunal va sanoat oqova suvlari uchun moslashuvchan biologik texnologiya.",
        },
        {
          code: "MBBR",
          title: "Bioplyonkali texnologiya",
          text: "O‘zgaruvchan organik yuklama sharoitida barqaror ishlash.",
        },
        {
          code: "RO / UF",
          title: "Membranali suv tayyorlash",
          text: "Qo‘shimcha tozalash, suv tayyorlash va suvdan qayta foydalanish.",
        },
      ],
    },

    solutions: {
      label: "SOHALAR BO‘YICHA YECHIMLAR",
      title: "Yechim sizning\nobyektingizdan boshlanadi.",
      text: "Tizimlarni oqova suv tarkibi, korxonaning ish rejimi va tozalangan suv sifatiga qo‘yiladigan talablarni hisobga olgan holda loyihalaymiz.",

      industries: [
        "To‘qimachilik korxonalari",
        "Oziq-ovqat ishlab chiqarish",
        "Sut korxonalari",
        "Go‘shtni qayta ishlash korxonalari",
        "Parrandachilik fabrikalari",
        "Mehmonxonalar va shifoxonalar",
        "Turar-joy majmualari",
        "Aeroportlar",
      ],
    },

    services: {
      label: "TO‘LIQ ISHLAR SIKLI",
      title: "Bitta pudratchi.\nLoyihaning to‘liq sikli.",
      text: "Boshlang‘ich ma’lumotlarni tahlil qilish va texnologik sxemani ishlab chiqishdan uskunalarni yetkazib berish, obyektni ishga tushirish va keyingi servis xizmatigacha.",

      steps: [
        {
          title: "Tahlil",
          text: "Boshlang‘ich ma’lumotlar, suv tarkibi va obyekt talablarini o‘rganish.",
        },
        {
          title: "Loyihalash",
          text: "Texnologiyani tanlash va muhandislik yechimini ishlab chiqish.",
        },
        {
          title: "Ishlab chiqarish",
          text: "Texnologik uskunalarni ishlab chiqarish va komplektlash.",
        },
        {
          title: "Yetkazib berish",
          text: "Uskunalarni bevosita obyektga yetkazib berishni tashkil etish.",
        },
        {
          title: "Montaj",
          text: "Uskunalarni montaj qilish va muhandislik tizimlari shef-montaji.",
        },
        {
          title: "Ishga tushirish",
          text: "Tizimni ishga tushirish, jarayonlarni sozlash va xodimlarni o‘qitish.",
        },
        {
          title: "Servis",
          text: "Texnik xizmat ko‘rsatish, diagnostika va ehtiyot qismlar.",
        },
      ],

      bottomLabel: "LOYIHANI BOSHLASH",
      bottomTitle: "Texnik topshiriq\nyoki boshlang‘ich ma’lumotlar bormi?",
      bottomText:
        "Texnik topshiriq, suv yoki oqova suv tahlillari, unumdorlik va obyekt talablarini yuboring. Dastlabki texnik yechimni tayyorlaymiz.",
      bottomButton: "Texnik topshiriqni yuborish",
    },

    contacts: {
      label: "ALOQA",
      title: "Loyihangizni\nmuhokama qilamiz.",
      intro:
        "Oqova suvlarni tozalash, suv tayyorlash yoki uskuna tanlash kerakmi? Boshlang‘ich ma’lumotlarni yuboring — dastlabki texnik yechim tayyorlaymiz.",

      phone: "TELEFON / TELEGRAM",
      email: "E-MAIL",
      workRegion: "ISHLASH HUDUDI",
      directions: "YO‘NALISHLAR",

      regions: ["O‘zbekiston", "MDH davlatlari", "Xalqaro loyihalar"],

      directionItems: [
        "Oqova suv tozalash inshootlari",
        "Suv tayyorlash",
        "Sanoat uskunalari",
        "Injiniring",
      ],

      requirementsTitle: "DASTLABKI HISOB-KITOB UCHUN YETARLI",

      requirements: [
        "Obyekt turi",
        "Unumdorlik, m³/kun",
        "Suv yoki oqova suv tahlillari",
        "Tozalangan suvga qo‘yiladigan talablar",
      ],

      formLabel: "ARIZA YUBORISH",
      formTitle: "Dastlabki\ntexnik yechimni oling.",
      formText:
        "Obyekt haqidagi asosiy ma’lumotlarni kiriting. Mutaxassisimiz ma’lumotlarni o‘rganib, siz bilan bog‘lanadi.",

      nameLabel: "ISM / KOMPANIYA *",
      namePlaceholder: "Ismingiz yoki kompaniya nomi",

      phoneLabel: "TELEFON / TELEGRAM *",

      objectLabel: "OBYEKT TURI",
      objectPlaceholder: "Obyektni tanlang",

      objectTypes: {
        industrial: "Sanoat korxonasi",
        textile: "To‘qimachilik korxonasi",
        food: "Oziq-ovqat ishlab chiqarish",
        residential: "Turar-joy majmuasi",
        hotel: "Mehmonxona",
        hospital: "Shifoxona",
        airport: "Aeroport",
        water: "Suv tayyorlash",
        other: "Boshqa obyekt",
      },

      capacityLabel: "UNUMDORLIK",
      capacityPlaceholder: "Masalan: 1500 m³/kun",

      messageLabel: "IZOH / VAZIFA TAVSIFI",
      messagePlaceholder:
        "Vazifa, talablar yoki mavjud boshlang‘ich ma’lumotlarni qisqacha yozing...",

      canPrepare: "TAYYORLAB YUBORISHINGIZ MUMKIN",
      canPrepareText:
        "Texnik topshiriq · Suv/oqova suv tahlillari · Chizmalar · Suv sifatiga talablar",

      submit: "ARIZA YUBORISH",
      submitting: "YUBORILMOQDA...",

      privacy:
        "Tugmani bosish orqali taqdim etilgan ma’lumotlarni qayta ishlashga rozilik bildirasiz.",

      successLabel: "ARIZA YUBORILDI",
      successTitle: "Murojaatingiz uchun rahmat.",
      successText:
        "Arizangiz muvaffaqiyatli yuborildi. Mutaxassisimiz ma’lumotlarni o‘rganib, siz bilan bog‘lanadi.",
      sendAgain: "Yana ariza yuborish",

      error: "Arizani yuborib bo‘lmadi. Qayta urinib ko‘ring.",
    },

    mega: {
      industry: "SANOAT",
      infrastructure: "INFRATUZILMA",
      residential: "TURAR-JOY OBYEKTLARI",
      special: "MAXSUS YECHIMLAR",

      textile: "To‘qimachilik korxonalari",
      food: "Oziq-ovqat ishlab chiqarish",
      dairy: "Sut korxonalari",
      meat: "Go‘shtni qayta ishlash korxonalari",
      poultry: "Parrandachilik fabrikalari",

      airports: "Aeroportlar",
      hotels: "Mehmonxonalar",
      hospitals: "Shifoxonalar",
      shopping: "Savdo markazlari",
      business: "Biznes markazlari",

      residentialComplex: "Turar-joy majmualari",
      cottage: "Kottej shaharchalari",
      privateObjects: "Xususiy obyektlar",
      commercialObjects: "Tijorat obyektlari",

      reuse: "Suvdan qayta foydalanish",
      industrialWastewater: "Murakkab sanoat oqova suvlari",
      modernization: "Mavjud tozalash inshootlarini modernizatsiya qilish",
      individualDesign: "Individual loyihalash",

      individualLabel: "INDIVIDUAL YECHIM",
      individualTitle: "Sohangizni\ntopmadingizmi?",
      individualText:
        "Oqova suv tarkibi, unumdorlik va obyektingiz talablariga mos texnologik yechim ishlab chiqamiz.",
      individualButton: "Yechim olish",

      biological: "BIOLOGIK TOZALASH",
      membrane: "MEMBRANALI TEXNOLOGIYALAR",
      physicalChemical: "FIZIK-KIMYOVIY TOZALASH",
      disinfection: "ZARARSIZLANTIRISH",

      engineeringSelection: "MUHANDISLIK TANLOVI",
      technologyQuestion: "Obyektingizga qaysi\ntexnologiya kerak?",
      technologyText:
        "Oqova suv tarkibi, unumdorlik va tozalangan suv sifatiga qo‘yiladigan talablarni tahlil qilamiz.",
      technologiesCount: "texnologiya",
      selectTechnology: "Texnologiyani tanlash",

      engineering: "INJINIRING",
      implementation: "AMALGA OSHIRISH",
      afterLaunch: "ISHGA TUSHIRISHDAN KEYIN",

      sourceAnalysis: "Boshlang‘ich ma’lumotlarni tahlil qilish",
      technologySelection: "Texnologiyani tanlash",
      calculation: "Texnologik hisob-kitob",
      design: "Loyihalash",
      specification: "Spetsifikatsiya tayyorlash",

      production: "Uskunalarni ishlab chiqarish",
      delivery: "Uskunalarni yetkazib berish",
      installation: "Montaj",
      supervision: "Shef-montaj",
      commissioning: "Ishga tushirish-sozlash ishlari",

      warranty: "Kafolat xizmati",
      maintenance: "Servis xizmati",
      diagnostics: "Uskunalar diagnostikasi",
      spareParts: "Ehtiyot qismlarni yetkazib berish",
      modernizationSystems: "Tizimlarni modernizatsiya qilish",

      haveSpecification: "TEXNIK TOPSHIRIQ BORMI?",
      sendSpecificationTitle: "Texnik topshiriqni yuboring —\nyechim tayyorlaymiz.",
      sendSpecificationText:
        "Boshlang‘ich ma’lumotlarni o‘rganamiz, texnologiya va uskunalarni tanlaymiz hamda dastlabki texnik taklifni tayyorlaymiz.",
      sendSpecification: "Texnik topshiriqni yuborish",
    },

    footer: {
      description: "Suv va oqova suvlarni tozalash\nmuhandislik tizimlari.",
      navigation: "NAVIGATSIYA",
      contact: "BOG‘LANISH",
      copyright: "© 2026 SUVSANOAT. Barcha huquqlar himoyalangan.",
      slogan: "WATER · WASTEWATER · ENGINEERING",
    },

    floating: {
      write: "YOZISH",
      call: "QO‘NG‘IROQ",
      top: "YUQORIGA",
    },
  },

  en: {
    language: "EN",

    nav: {
      catalog: "Catalog",
      solutions: "Solutions",
      technologies: "Technologies",
      projects: "Projects",
      services: "Services",
      contacts: "Contacts",
      calculation: "Get a Quote",
      menu: "MENU",
      closeMenu: "Close menu",
    },

    hero: {
      slides: [
        {
          label: "WATER TREATMENT ENGINEERING SYSTEMS",
          title: "Clean water.\nPrecise solutions.",
          text: "Design, manufacturing and supply of wastewater treatment and water treatment equipment.",
        },
        {
          label: "INDUSTRIAL WASTEWATER TREATMENT PLANTS",
          title: "From design\nto commissioning.",
          text: "Integrated wastewater treatment plants for industrial, commercial and infrastructure facilities.",
        },
        {
          label: "DISINFECTION AND DOSING",
          title: "Precise control.\nReliable water.",
          text: "Chlorination units, dosing systems and automated equipment for water disinfection.",
        },
      ],
      catalogButton: "View Catalog",
      calculationButton: "Get a Quote",
      slide: "Slide",
    },

    categories: [
      "Wastewater Treatment Plants",
      "Water Treatment",
      "Mechanical Treatment",
      "Pumping Equipment",
      "Disinfection and Dosing",
      "Sludge Treatment",
      "Aeration Equipment",
      "Tanks and Reservoirs",
      "Automation",
      "Valves and Pipelines",
      "Treatment Technologies",
      "Integrated Solutions",
    ],

    stats: [
      {
        strong: "5–200,000",
        label: "m³/day · ANY SCALE",
        text: "From compact local systems to large industrial treatment complexes",
      },
      {
        strong: "TURNKEY",
        label: "FULL CYCLE",
        text: "Design, manufacturing, supply, installation and commissioning",
      },
      {
        strong: "FOR YOUR FACILITY",
        label: "CUSTOM ENGINEERING",
        text: "Technology and equipment tailored to the requirements of each project",
      },
      {
        strong: "SERVICE",
        label: "AFTER COMMISSIONING",
        text: "Technical support, maintenance and spare parts",
      },
    ],

    catalog: {
      label: "SUVSANOAT CATALOG",
      title: "Everything for water.\nOne integrated system.",
      text: "Integrated equipment for wastewater treatment, water treatment, pumping systems, automation and industrial infrastructure.",
    },

    technologies: {
      label: "SUVSANOAT TECHNOLOGIES",
      title: "Not just a technology.\nThe right technology.",
      text: "We select the treatment process based on wastewater composition, capacity, treated water quality requirements and operating conditions.",

      cards: [
        {
          code: "MBR",
          title: "Membrane Bioreactor",
          text: "High treatment efficiency with a compact treatment plant footprint.",
        },
        {
          code: "SBR",
          title: "Sequential Batch Treatment",
          text: "Flexible biological treatment technology for municipal and industrial wastewater.",
        },
        {
          code: "MBBR",
          title: "Biofilm Technology",
          text: "Stable operation under changing organic loads.",
        },
        {
          code: "RO / UF",
          title: "Membrane Water Treatment",
          text: "Advanced treatment, water purification and water reuse.",
        },
      ],
    },

    solutions: {
      label: "INDUSTRY SOLUTIONS",
      title: "The solution starts\nwith your facility.",
      text: "We design systems based on wastewater composition, facility operating conditions and treated water quality requirements.",

      industries: [
        "Textile Plants",
        "Food Processing",
        "Dairy Plants",
        "Meat Processing Plants",
        "Poultry Farms",
        "Hotels and Hospitals",
        "Residential Complexes",
        "Airports",
      ],
    },

    services: {
      label: "FULL PROJECT CYCLE",
      title: "One contractor.\nThe entire project cycle.",
      text: "From initial data analysis and process design to equipment supply, commissioning and ongoing technical service.",

      steps: [
        {
          title: "Analysis",
          text: "Assessment of initial data, water composition and facility requirements.",
        },
        {
          title: "Engineering",
          text: "Technology selection and development of the engineering solution.",
        },
        {
          title: "Manufacturing",
          text: "Manufacturing and integration of process equipment.",
        },
        {
          title: "Delivery",
          text: "Organization of equipment delivery directly to the project site.",
        },
        {
          title: "Installation",
          text: "Equipment installation and installation supervision for engineering systems.",
        },
        {
          title: "Commissioning",
          text: "System start-up, process adjustment and personnel training.",
        },
        {
          title: "Service",
          text: "Maintenance, diagnostics and spare parts supply.",
        },
      ],

      bottomLabel: "START A PROJECT",
      bottomTitle: "Do you have a technical specification\nor initial project data?",
      bottomText:
        "Send us your technical specification, water or wastewater analyses, required capacity and project requirements. We will prepare a preliminary technical solution.",
      bottomButton: "Send Technical Specification",
    },

    contacts: {
      label: "CONTACTS",
      title: "Let's discuss\nyour project.",
      intro:
        "Need wastewater treatment, water treatment or equipment selection? Send us your initial project data and we will prepare a preliminary technical solution.",

      phone: "PHONE / TELEGRAM",
      email: "E-MAIL",
      workRegion: "SERVICE AREA",
      directions: "EXPERTISE",

      regions: ["Uzbekistan", "CIS countries", "International projects"],

      directionItems: [
        "Wastewater treatment plants",
        "Water treatment",
        "Industrial equipment",
        "Engineering",
      ],

      requirementsTitle: "FOR A PRELIMINARY CALCULATION WE NEED",

      requirements: [
        "Facility type",
        "Capacity, m³/day",
        "Water or wastewater analysis",
        "Treated water requirements",
      ],

      formLabel: "SEND REQUEST",
      formTitle: "Get a preliminary\ntechnical solution.",
      formText:
        "Provide the basic project information. Our specialist will review it and contact you.",

      nameLabel: "NAME / COMPANY *",
      namePlaceholder: "Your name or company",

      phoneLabel: "PHONE / TELEGRAM *",

      objectLabel: "FACILITY TYPE",
      objectPlaceholder: "Select facility",

      objectTypes: {
        industrial: "Industrial facility",
        textile: "Textile plant",
        food: "Food processing facility",
        residential: "Residential complex",
        hotel: "Hotel",
        hospital: "Hospital",
        airport: "Airport",
        water: "Water treatment",
        other: "Other facility",
      },

      capacityLabel: "CAPACITY",
      capacityPlaceholder: "For example: 1500 m³/day",

      messageLabel: "COMMENTS / PROJECT DESCRIPTION",
      messagePlaceholder:
        "Briefly describe the task, requirements or available project data...",

      canPrepare: "YOU CAN PROVIDE",
      canPrepareText:
        "Technical specification · Water/wastewater analyses · Drawings · Water quality requirements",

      submit: "SEND REQUEST",
      submitting: "SENDING...",

      privacy:
        "By submitting this form, you agree to the processing of the information provided.",

      successLabel: "REQUEST SENT",
      successTitle: "Thank you for contacting us.",
      successText:
        "Your request has been successfully sent. Our specialist will review the information and contact you.",
      sendAgain: "Send another request",

      error: "Unable to send your request. Please try again.",
    },

    mega: {
      industry: "INDUSTRY",
      infrastructure: "INFRASTRUCTURE",
      residential: "RESIDENTIAL",
      special: "SPECIAL SOLUTIONS",

      textile: "Textile Plants",
      food: "Food Processing",
      dairy: "Dairy Plants",
      meat: "Meat Processing Plants",
      poultry: "Poultry Farms",

      airports: "Airports",
      hotels: "Hotels",
      hospitals: "Hospitals",
      shopping: "Shopping Centers",
      business: "Business Centers",

      residentialComplex: "Residential Complexes",
      cottage: "Cottage Communities",
      privateObjects: "Private Facilities",
      commercialObjects: "Commercial Facilities",

      reuse: "Water Reuse",
      industrialWastewater: "Complex Industrial Wastewater",
      modernization: "Existing WWTP Modernization",
      individualDesign: "Custom Engineering",

      individualLabel: "CUSTOM SOLUTION",
      individualTitle: "Can't find\nyour industry?",
      individualText:
        "We will develop a treatment solution based on wastewater composition, capacity and your facility requirements.",
      individualButton: "Get a Solution",

      biological: "BIOLOGICAL TREATMENT",
      membrane: "MEMBRANE TECHNOLOGIES",
      physicalChemical: "PHYSICOCHEMICAL TREATMENT",
      disinfection: "DISINFECTION",

      engineeringSelection: "ENGINEERING SELECTION",
      technologyQuestion: "Which technology\nis right for your facility?",
      technologyText:
        "We analyze wastewater composition, capacity and treated water quality requirements.",
      technologiesCount: "technologies",
      selectTechnology: "Select Technology",

      engineering: "ENGINEERING",
      implementation: "IMPLEMENTATION",
      afterLaunch: "AFTER COMMISSIONING",

      sourceAnalysis: "Initial Data Analysis",
      technologySelection: "Technology Selection",
      calculation: "Process Calculation",
      design: "Engineering Design",
      specification: "Specification Preparation",

      production: "Equipment Manufacturing",
      delivery: "Equipment Supply",
      installation: "Installation",
      supervision: "Installation Supervision",
      commissioning: "Commissioning",

      warranty: "Warranty Service",
      maintenance: "Maintenance Service",
      diagnostics: "Equipment Diagnostics",
      spareParts: "Spare Parts Supply",
      modernizationSystems: "System Modernization",

      haveSpecification: "HAVE A TECHNICAL SPECIFICATION?",
      sendSpecificationTitle: "Send your specification —\nwe'll prepare a solution.",
      sendSpecificationText:
        "We will review the initial data, select the technology and equipment, and prepare a preliminary technical proposal.",
      sendSpecification: "Send Technical Specification",
    },

    footer: {
      description: "Engineering systems for water\nand wastewater treatment.",
      navigation: "NAVIGATION",
      contact: "CONTACT",
      copyright: "© 2026 SUVSANOAT. All rights reserved.",
      slogan: "WATER · WASTEWATER · ENGINEERING",
    },

    floating: {
      write: "MESSAGE",
      call: "CALL",
      top: "TOP",
    },
  },
} as const;