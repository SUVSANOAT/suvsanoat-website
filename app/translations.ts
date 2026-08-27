export type Language = "ru" | "uz" | "en" | "zh";

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
      engineering: "Инженерный расчёт",
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
      carWash: "Автомойки",

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
      engineering: "Muhandislik hisob-kitobi",
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
      carWash: "Avtomoykalar",

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
      engineering: "Engineering Calculation",
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
      carWash: "Car Washes",

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

  zh: {
    language: "中文",

    nav: {
      catalog: "产品目录",
      solutions: "解决方案",
      technologies: "技术",
      projects: "项目",
      services: "服务",
      contacts: "联系我们",
      calculation: "获取报价",
      menu: "菜单",
      closeMenu: "关闭菜单",
      engineering: "工程计算",
    },

    hero: {
      slides: [
        {
          label: "水处理工程系统",
          title: "洁净水。\n精准解决方案。",
          text: "提供污水处理和水处理设备的设计、制造与供应。",
        },
        {
          label: "工业污水处理设施",
          title: "从设计\n到投运。",
          text: "为工业、商业和基础设施项目提供完整的污水处理解决方案。",
        },
        {
          label: "消毒与加药",
          title: "精准控制。\n可靠水质。",
          text: "提供加氯设备、加药系统及水消毒自动化设备。",
        },
      ],
      catalogButton: "查看产品目录",
      calculationButton: "获取报价",
      slide: "幻灯片",
    },

    categories: [
      "污水处理设施",
      "水处理",
      "机械处理",
      "泵送设备",
      "消毒与加药",
      "污泥处理",
      "曝气设备",
      "储罐与容器",
      "自动化",
      "阀门与管道",
      "处理技术",
      "综合解决方案",
    ],

    stats: [
      {
        strong: "5–200,000",
        label: "m³/天 · 任意规模",
        text: "从小型本地系统到大型工业污水处理综合设施",
      },
      {
        strong: "交钥匙",
        label: "完整项目周期",
        text: "设计、制造、供应、安装和调试",
      },
      {
        strong: "适配您的项目",
        label: "定制工程",
        text: "根据每个项目的具体要求定制技术和设备",
      },
      {
        strong: "服务",
        label: "投运后支持",
        text: "技术支持、维护和备件供应",
      },
    ],

    catalog: {
      label: "SUVSANOAT 产品目录",
      title: "水处理所需的一切。\n集成于一个系统。",
      text: "为污水处理、水处理、泵送系统、自动化和工业基础设施提供综合设备。",
    },

    technologies: {
      label: "SUVSANOAT 技术",
      title: "不只是选择技术。\n而是选择正确的技术。",
      text: "我们根据污水水质、处理量、出水水质要求和运行条件选择最佳处理工艺。",
      cards: [
        {
          code: "MBR",
          title: "膜生物反应器",
          text: "高效处理并减少污水处理设施占地面积。",
        },
        {
          code: "SBR",
          title: "序批式生物处理",
          text: "适用于市政和工业污水的灵活生物处理技术。",
        },
        {
          code: "MBBR",
          title: "生物膜技术",
          text: "在有机负荷变化条件下保持稳定运行。",
        },
        {
          code: "RO / UF",
          title: "膜法水处理",
          text: "深度处理、纯化和水资源回用。",
        },
      ],
    },

    solutions: {
      label: "行业解决方案",
      title: "解决方案始于\n您的项目。",
      text: "根据污水水质、企业运行条件和出水水质要求进行系统设计。",
      industries: [
        "纺织企业",
        "食品加工企业",
        "乳制品企业",
        "肉类加工企业",
        "家禽养殖企业",
        "酒店和医院",
        "住宅综合体",
        "机场",
      ],
    },

    services: {
      label: "完整项目周期",
      title: "一个承包商。\n完整项目周期。",
      text: "从基础数据分析和工艺设计，到设备供应、项目调试以及后续技术服务。",
      steps: [
        {
          title: "分析",
          text: "评估基础数据、水质和项目要求。",
        },
        {
          title: "工程设计",
          text: "选择处理技术并制定工程解决方案。",
        },
        {
          title: "制造",
          text: "制造并集成工艺设备。",
        },
        {
          title: "供应",
          text: "组织设备直接运送至项目现场。",
        },
        {
          title: "安装",
          text: "设备安装及工程系统安装监督。",
        },
        {
          title: "调试",
          text: "系统启动、工艺调试和人员培训。",
        },
        {
          title: "服务",
          text: "维护、诊断和备件供应。",
        },
      ],
      bottomLabel: "启动项目",
      bottomTitle: "您有技术任务书\n或项目基础数据吗？",
      bottomText:
        "请发送技术任务书、水或污水分析、处理量及项目要求。我们将准备初步技术方案。",
      bottomButton: "发送技术任务书",
    },

    contacts: {
      label: "联系我们",
      title: "让我们讨论\n您的项目。",
      intro:
        "需要污水处理、水处理或设备选型？发送项目基础数据，我们将准备初步技术方案。",
      phone: "电话 / TELEGRAM",
      email: "电子邮箱",
      workRegion: "服务区域",
      directions: "业务方向",
      regions: ["乌兹别克斯坦", "独联体国家", "国际项目"],
      directionItems: [
        "污水处理设施",
        "水处理",
        "工业设备",
        "工程技术",
      ],
      requirementsTitle: "初步计算所需资料",
      requirements: [
        "项目类型",
        "处理量，m³/天",
        "水或污水分析",
        "出水水质要求",
      ],
      formLabel: "提交申请",
      formTitle: "获取初步\n技术方案。",
      formText:
        "填写项目基本信息。我们的专家将审核资料并与您联系。",
      nameLabel: "姓名 / 公司 *",
      namePlaceholder: "您的姓名或公司名称",
      phoneLabel: "电话 / TELEGRAM *",
      objectLabel: "项目类型",
      objectPlaceholder: "选择项目类型",
      objectTypes: {
        industrial: "工业企业",
        textile: "纺织企业",
        food: "食品加工企业",
        residential: "住宅综合体",
        hotel: "酒店",
        hospital: "医院",
        airport: "机场",
        water: "水处理",
        other: "其他项目",
      },
      capacityLabel: "处理量",
      capacityPlaceholder: "例如：1500 m³/天",
      messageLabel: "备注 / 项目描述",
      messagePlaceholder:
        "请简要描述任务、要求或现有项目资料……",
      canPrepare: "您可以提供",
      canPrepareText:
        "技术任务书 · 水/污水分析 · 图纸 · 出水水质要求",
      submit: "提交申请",
      submitting: "正在发送……",
      privacy: "提交表单即表示您同意处理所提供的信息。",
      successLabel: "申请已发送",
      successTitle: "感谢您的联系。",
      successText:
        "您的申请已成功发送。我们的专家将审核资料并与您联系。",
      sendAgain: "再次提交申请",
      error: "申请发送失败，请重试。",
    },

    mega: {
      industry: "工业",
      infrastructure: "基础设施",
      residential: "住宅项目",
      special: "特殊解决方案",
      textile: "纺织企业",
      food: "食品加工",
      dairy: "乳制品企业",
      meat: "肉类加工企业",
      poultry: "家禽养殖企业",
      airports: "机场",
      hotels: "酒店",
      hospitals: "医院",
      shopping: "购物中心",
      business: "商务中心",
      carWash: "洗车场",
      residentialComplex: "住宅综合体",
      cottage: "别墅社区",
      privateObjects: "私人项目",
      commercialObjects: "商业项目",
      reuse: "水回用",
      industrialWastewater: "复杂工业污水",
      modernization: "现有污水处理设施改造",
      individualDesign: "定制工程设计",
      individualLabel: "定制解决方案",
      individualTitle: "没有找到\n您的行业？",
      individualText:
        "我们将根据污水水质、处理量和项目要求，为您制定专属处理方案。",
      individualButton: "获取解决方案",
      biological: "生物处理",
      membrane: "膜技术",
      physicalChemical: "物理化学处理",
      disinfection: "消毒",
      engineeringSelection: "工程选型",
      technologyQuestion: "您的项目需要\n哪种处理技术？",
      technologyText:
        "我们分析污水水质、处理量和出水水质要求。",
      technologiesCount: "项技术",
      selectTechnology: "选择技术",
      engineering: "工程",
      implementation: "实施",
      afterLaunch: "投运后",
      sourceAnalysis: "基础数据分析",
      technologySelection: "技术选型",
      calculation: "工艺计算",
      design: "工程设计",
      specification: "规格书编制",
      production: "设备制造",
      delivery: "设备供应",
      installation: "安装",
      supervision: "安装监督",
      commissioning: "调试",
      warranty: "保修服务",
      maintenance: "维护服务",
      diagnostics: "设备诊断",
      spareParts: "备件供应",
      modernizationSystems: "系统改造",
      haveSpecification: "有技术任务书吗？",
      sendSpecificationTitle: "发送您的技术任务书 —\n我们准备解决方案。",
      sendSpecificationText:
        "我们将审核基础数据，选择处理技术和设备，并准备初步技术方案。",
      sendSpecification: "发送技术任务书",
    },

    footer: {
      description: "水处理和\n污水处理工程系统。",
      navigation: "导航",
      contact: "联系我们",
      copyright: "© 2026 SUVSANOAT. 版权所有。",
      slogan: "WATER · WASTEWATER · ENGINEERING",
    },

    floating: {
      write: "留言",
      call: "拨打电话",
      top: "返回顶部",
    },
  },

} as const;