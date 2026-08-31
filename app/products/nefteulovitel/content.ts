import type { LineContentSet } from "../lineTypes";

/**
 * Страница модельного ряда НЕФ: «нефтеуловитель», «нефтеловушка»,
 * «сепаратор нефтепродуктов», «маслобензоотделитель»,
 * «очистка ливневых стоков», «нефтеуловитель для автомойки / АЗС /
 * паркинга», «neft tutgich», «oil separator».
 *
 * Все числа взяты из app/products/data.ts (модели line: "oil-separators"
 * и TEXT[...].lines["oil-separators"]): ряд НЕФ-1,5…НЕФ-50, удельная
 * нагрузка 1,72 м/ч, шлам 200 л на 1 л/с, нефтепродукты 15 л на 1 л/с.
 */

const content: LineContentSet = {
  ru: {
    label: "НЕФТЕУЛОВИТЕЛИ",
    title: "Нефтеуловители\nот 1,5 до 50 л/с.",
    intro:
      "Нефтеловушка на выпуске автомойки, АЗС, паркинга или производственной площадки. Девять типоразмеров — от НЕФ-1,5 до НЕФ-50, то есть от 1,5 до 50 л/с (5,4–180 м³/ч). Корпус из стеклопластика собственной намотки, работа самотёком, без электричества и расходников. Производство — Ташкент.",
    sections: [
      {
        title: "Где нужен нефтеуловитель",
        text: [
          "Нефтеуловитель, нефтеловушка, сепаратор нефтепродуктов и маслобензоотделитель — одно изделие под разными названиями. Ставят там, где на покрытие попадают топливо и масла: автомойки, АЗС и АГНКС, открытые и подземные паркинги, СТО, автобазы, промплощадки. Отдельная задача — очистка ливневых стоков: дождь смывает с асфальта всё, что накопилось между дождями, и выносит в один выпуск за минуты.",
          "Причина не эстетическая. Нефтепродукты нормируются на сбросе: постановление КМ РУз № 11 от 03.02.2010 задаёт уровень 1,0 мг/л, и врезка в городскую канализацию, и выпуск на рельеф отсчитываются от этой величины. Без очистки согласование не проходит, а при проверке считается ущерб.",
          "Вторая причина — биология. Плёнка нефтепродуктов перекрывает кислородный обмен и убивает активный ил: залповый вынос масел выбивает биологическую ступень собственных ЛОС или городских сооружений на недели. Поэтому нефтеуловитель ставят до биологии, а не после.",
        ],
      },
      {
        title: "Как подбирается типоразмер",
        text: [
          "Типоразмер считается по секундному расходу, как в EN 858-2: НЕФ-10 — это 10 л/с, то есть 36 м³/ч. Для ливневых стоков расход считается от площади водосбора и расчётной интенсивности дождя по КМК 2.04.03-19; для автомойки — от числа одновременно работающих постов и расхода на пост: один аппарат высокого давления даёт 1,2–1,8 м³/ч. Подбор «по диаметру существующей трубы» ошибается в разы.",
          "Ступени выстраиваются цепочкой: песколовка, если на площадке много абразива; отстойная зона, где всплывают крупные капли; коалесцентно-ламельный модуль с шагом пластин 20 мм, собирающий мелкие капли в крупные; при жёстких требованиях к сбросу — сорбционный фильтр. Ряд рассчитан по скорости всплытия капли 100 мкм: при плотности 850 кг/м³ и температуре 15 °C это 2,58 м/ч, а удельная нагрузка на эффективную площадь принята 1,72 м/ч — с полуторным запасом.",
          "Два момента решают схему на подборе. Залповые ливни: сепаратор считается на расчётный расход, избыток сбрасывается мимо изделия через байпас. И отметка выпуска: изделие работает самотёком, и высота корпуса — от 1300 мм у НЕФ-1,5 до 2100 мм у НЕФ-50 — вместе с уклонами должна уложиться между лотком подводящей трубы и точкой врезки.",
        ],
      },
      {
        title: "Конструкция и обслуживание",
        text: [
          "Корпус — стеклопластик собственной намотки на изофталевой полиэфирной смоле, с рёбрами жёсткости; толщина ламината от 6 до 10 мм. Стеклопластик не корродирует в контакте с бензином, дизтопливом и маслами, в отличие от металла. Масса — от 100 кг у НЕФ-1,5 до 1055 кг у НЕФ-50. Установка подземная, в бетонной обойме; при высоких грунтовых водах корпус считается на всплытие, расчёт с анкеровкой идёт с паспортом.",
          "В работе накапливаются две фракции. Тяжёлый шлам оседает в приёмно-шламовой камере — 200 литров на каждый 1 л/с расчётного расхода. Всплывшая нефтяная плёнка собирается в верхней зоне — 15 литров на 1 л/с. Обе удаляются откачкой; электричества, реагентов и картриджей изделие не требует.",
          "Периодичность откачки зависит от объекта: на автомойке шламовую камеру смотрят чаще, на паркинге — реже. Ориентир задаёт регламент обслуживания с изделием, он уточняется по замерам первых месяцев. Коалесцентные блоки вынимаются через люки и промываются водой. Забитый песком пакет — самая частая причина падения эффективности, поэтому при высоком выносе абразива перед нефтеуловителем ставится песколовка.",
        ],
      },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Чем нефтеуловитель отличается от жироуловителя?",
        a: "Задачей и физикой. Жироуловитель работает с жирами кухонных стоков — они липкие и застывают на стенках. Нефтеуловитель работает с минеральными нефтепродуктами: бензином, дизтопливом, маслами. У них другая плотность и скорость всплытия, а внутри стоит коалесцентно-ламельный модуль, которого в жироуловителе нет. Заменять одно другим нельзя.",
      },
      {
        q: "Нужна ли песколовка перед нефтеуловителем?",
        a: "В изделии уже есть приёмно-шламовая камера — 200 литров на 1 л/с, для паркинга или АЗС этого обычно хватает. Отдельная песколовка нужна там, где выноса песка много: автомойка, стройплощадка, грунтовые подъезды. Абразив забивает ламельный пакет и делает обслуживание ежемесячным.",
      },
      {
        q: "Как часто обслуживать нефтеуловитель?",
        a: "Штатных операций две: замер слоя всплывших нефтепродуктов и уровня шлама — и откачка, когда накопление подходит к расчётному объёму (15 литров на 1 л/с по нефтепродуктам, 200 литров на 1 л/с по шламу). Интервал зависит от загрузки площадки, поэтому привязан к замеру, а не к календарю.",
      },
      {
        q: "Можно ли ставить нефтеуловитель под проездом?",
        a: "Да, при двух условиях: над корпусом устраивается железобетонная разгрузочная плита, а люки берутся в классе нагрузки под проходящий транспорт. Плита, обетонирование и земляные работы в поставку не входят, но схему установки с нагрузками мы выдаём.",
      },
      {
        q: "Какие документы вы выдаёте?",
        a: "Технологический расчёт (расход, эффективная площадь, удельная нагрузка), паспорт изделия, схему установки, расчёт корпуса на грунтовые нагрузки и всплытие, руководство по эксплуатации и регламент обслуживания. Расчёт открытый — его можно передать проектировщику и в экспертизу.",
      },
    ],
    ctaTitle: "Пришлите план площадки —\nвернём подбор.",
    ctaText:
      "Площадь и тип покрытий, число постов мойки, отметка канализации в точке врезки. Вернём расчёт расчётного расхода, подбор типоразмера и схему установки для строительной части.",
    ctaButton: "ЗАПРОСИТЬ ПОДБОР",
    related: {
      title: "Смежные линейки и решения",
      links: [
        { href: "/products/peskolovka", label: "Песколовки" },
        { href: "/products/zhiroulovitel", label: "Жироуловители" },
        { href: "/products/los-bio", label: "ЛОС БИО" },
        { href: "/solutions/car-wash", label: "Очистные для автомойки" },
        {
          href: "/solutions/gas-station",
          label: "Нефтеуловитель для АЗС и паркинга",
        },
        { href: "/products", label: "Весь ассортимент" },
      ],
    },
  },

  uz: {
    label: "NEFT TUTGICHLAR",
    title: "Neft tutgichlar\n1,5 dan 50 l/s gacha.",
    intro:
      "Avtoyuvish, ShAQSh, avtoturargoh yoki ishlab chiqarish maydonchasi chiqishiga o‘rnatiladigan neft tutgich. To‘qqizta o‘lcham — НЕФ-1,5 dan НЕФ-50 gacha, ya’ni 1,5 dan 50 l/s gacha (5,4–180 m³/soat). Korpus o‘z o‘ramimizdagi shishatolali plastikdan, ish o‘z oqimi bilan, elektrsiz va sarf materiallarisiz. Ishlab chiqarish — Toshkent.",
    sections: [
      {
        title: "Neft tutgich qayerda kerak",
        text: [
          "Neft tutgich, neft ushlagich va neft mahsulotlari separatori — bir xil mahsulotning turli nomlari. U qoplamaga yoqilg‘i va moy tushadigan joylarga o‘rnatiladi: avtoyuvish shoxobchalari, ShAQSh va AGNQSh, ochiq va yer osti avtoturargohlari, texnik xizmat stansiyalari, avtobazalar, sanoat maydonchalari va texnika turadigan maydonchalar. Alohida vazifa — yomg‘ir oqavasini tozalash: yomg‘ir asfaltdan yomg‘irlar orasida to‘plangan hamma narsani yuvib, bir necha daqiqada bitta chiqishga olib keladi.",
          "Sabab estetik emas. Neft mahsulotlari oqavada me’yorlanadi: O‘zbekiston Respublikasi Vazirlar Mahkamasining 03.02.2010 yildagi 11-sonli qarori 1,0 mg/l darajasini belgilaydi, shahar kanalizatsiyasiga ulanish talablari ham, relyefga yoki suv havzasiga chiqarish talablari ham shu qiymatdan kelib chiqadi. Chiqishda tozalash bo‘lmasa, kelishuv o‘tmaydi, tekshiruvda esa zarar hisoblanadi.",
          "Ikkinchi sabab — biologiya. Neft mahsulotlari pardasi kislorod almashinuvini to‘sadi va faol loyni bo‘g‘adi: oqava o‘z lokal tozalash inshootlariga yoki shahar inshootlariga borsa, moylarning bir vaqtdagi ko‘p tushishi biologik bosqichni haftalab ishdan chiqaradi. Shuning uchun neft tutgich har doim biologiyadan oldin turadi, undan keyin emas.",
        ],
      },
      {
        title: "O‘lcham qanday tanlanadi",
        text: [
          "Tanlov sekundiga litrdagi sarf bo‘yicha boradi — EN 858-2 dagi kabi: НЕФ-10 bu 10 l/s, ya’ni 36 m³/soat. Yomg‘ir oqavasi uchun sarf suv yig‘ish maydoni va KMK 2.04.03-19 bo‘yicha hisobiy yomg‘ir jadalligidan, qoplama turini hisobga olib topiladi; avtoyuvish uchun — bir vaqtda ishlaydigan postlar soni va bitta post sarfidan: bitta yuqori bosimli apparat 1,2–1,8 m³/soat beradi. «Mavjud quvur diametri bo‘yicha» tanlash ikki tomonga ham bir necha barobar xatolik beradi.",
          "Keyin bosqichlar zanjiri quriladi: abraziv ko‘p bo‘lsa — qum tutgich; yirik tomchilar suzib chiqadigan tindirish zonasi; plastinka qadami 20 mm bo‘lgan koalessent-lamel moduli, u mayda tomchilarni yiriklashtirib yuzaga chiqaradi; oqavaga talab qattiq bo‘lsa — separatordan keyin sorbsion filtr. Qator tomchining suzib chiqish tezligi bo‘yicha hisoblangan: 100 mkm tomcha uchun neft mahsuloti zichligi 850 kg/m³ va suv harorati 15 °C bo‘lganda bu 2,58 m/soat, samarali yuzaga solishtirma yuklama esa butun qator bo‘yicha 1,72 m/soat qilib olingan — hisobiy tezlikka 1,5 karra zaxira bilan.",
          "Sxema taqdirini tanlov bosqichidayoq ikki narsa hal qiladi. Birinchisi — kuchli jala: separator hisobiy sarfga hisoblanadi, kamdan-kam uchraydigan maksimumga emas, shuning uchun sxemaga baypas yoki ortiqcha suvni mahsulot yonidan o‘tkazadigan taqsimlash kamerasi kiritiladi. Ikkinchisi — chiqish belgisi va ko‘mish chuqurligi: mahsulot o‘z oqimi bilan ishlaydi, korpus balandligi (НЕФ-1,5 da 1300 mm dan НЕФ-50 da 2100 mm gacha) qiyaliklar bilan birga keluvchi quvur tagi va ulanish nuqtasi belgisi orasiga sig‘ishi kerak.",
        ],
      },
      {
        title: "Konstruksiya va xizmat ko‘rsatish",
        text: [
          "Korpus — izoftal poliefir smolasida o‘z o‘ramimizdagi shishatolali plastik, qattiqlik qovurg‘alari bilan; laminat qalinligi kichik o‘lchamlarda 6 mm dan НЕФ-50 da 10 mm gacha. Shishatolali plastik benzin, dizel yoqilg‘isi va moylar bilan aloqada zanglamaydi va yemirilmaydi — bu muhitda va gruntda ancha kam xizmat qiladigan metalldan farqli. Mahsulot massasi — НЕФ-1,5 da 100 kg dan НЕФ-50 da 1055 kg gacha. O‘rnatish yer ostiga, beton qobiqda; sizot suvlari yuqori bo‘lganda korpus suzib chiqishga hisoblanadi va plitaga ankerlash hisobi pasport bilan birga beriladi.",
          "Ishlash davomida mahsulot ikki fraksiyani to‘playdi. Og‘ir shlam qabul-shlam kamerasiga cho‘kadi — uning hajmi hisobiy sarfning har 1 l/s uchun 200 litr hisobidan olingan. Suzib chiqqan neft pardasi yuqori zonada 1 l/s uchun 15 litr hisobidan yig‘iladi. Ikkala fraksiya ham assenizatsiya mashinasi bilan so‘rib olinadi; mahsulot elektr, reagent va almashtiriladigan kartrijlarni talab qilmaydi.",
          "So‘rib olish davriyligi obyektga bog‘liq: doimiy yuklamali avtoyuvishda shlam kamerasi tez-tez ko‘riladi, avtoturargohda — kamroq. Mo‘ljalni mahsulot bilan keladigan xizmat reglamenti beradi va u dastlabki oylardagi o‘lchovlar bo‘yicha aniqlanadi. Koalessent bloklar lyuklar orqali chiqariladi va korpusni qismlarga ajratmasdan suv bilan yuviladi. Qum bilan tiqilgan paket — samaradorlik pasayishining eng ko‘p uchraydigan sababi, shuning uchun abraziv ko‘p chiqadigan joylarda neft tutgichdan oldin alohida qum tutgich o‘rnatiladi.",
        ],
      },
    ],
    faqTitle: "Ko‘p beriladigan savollar",
    faq: [
      {
        q: "Neft tutgich yog‘ tutgichdan nimasi bilan farq qiladi?",
        a: "Vazifasi va jarayon fizikasi bilan. Yog‘ tutgich oshxona oqavasidagi o‘simlik va hayvon yog‘lari bilan ishlaydi — ular yengil, yopishqoq va devorlarda qotadi. Neft tutgich mineral neft mahsulotlari bilan ishlaydi: benzin, dizel yoqilg‘isi, moylar. Ularning zichligi, suzib chiqish tezligi va korpus materialiga ta’siri boshqacha, ichida esa yog‘ tutgichda yo‘q koalessent-lamel moduli turadi. Birini ikkinchisi bilan almashtirib bo‘lmaydi.",
      },
      {
        q: "Neft tutgichdan oldin qum tutgich kerakmi?",
        a: "Mahsulotda 1 l/s uchun 200 litrli qabul-shlam kamerasi allaqachon bor va avtoturargoh yoki ShAQSh uchun bu odatda yetarli. Alohida qum tutgich qum ko‘p chiqadigan joylarda kerak: avtoyuvish, qurilish maydonchasi, tuproq yo‘llar. Abraziv lamel paketini tiqadi, samaradorlik pasayadi, xizmat esa oylik bo‘lib qoladi.",
      },
      {
        q: "Neft tutgichga qanchalik tez-tez xizmat ko‘rsatiladi?",
        a: "Muntazam ikkita amal bor: suzib chiqqan neft mahsulotlari qatlami va shlam sathini o‘lchab ko‘rish — hamda to‘planish hisobiy hajmga yaqinlashganda so‘rib olish (neft mahsulotlari bo‘yicha 1 l/s uchun 15 litr, shlam bo‘yicha 1 l/s uchun 200 litr). Oraliq maydoncha yuklamasiga bog‘liq, shuning uchun reglamentda u kalendarga emas, o‘lchovga bog‘langan. Koalessent bloklar so‘rib olish paytida suv bilan yuviladi.",
      },
      {
        q: "Neft tutgichni yo‘l ostiga o‘rnatish mumkinmi?",
        a: "Ha, ikki shart bilan: korpus ustiga temir-beton yuk tushiruvchi plita quriladi, lyuklar esa o‘tadigan transportga mos yuklama sinfida olinadi. Plita, betonlash va yer ishlari yetkazib berishga kirmaydi — bu qurilish qismi, lekin yuklamalar ko‘rsatilgan o‘rnatish sxemasini mahsulot bilan beramiz.",
      },
      {
        q: "Qanday hujjatlar berasiz?",
        a: "Texnologik hisob (hisobiy sarf, samarali yuza, solishtirma yuklama), mahsulot pasporti, o‘rnatish sxemasi, korpusning grunt yuklari va suzib chiqishga hisobi, foydalanish qo‘llanmasi va xizmat reglamenti. Hisob ochiq — uni loyihachiga va ekspertizaga berish mumkin.",
      },
    ],
    ctaTitle: "Maydoncha rejasini yuboring —\ntanlovni qaytaramiz.",
    ctaText:
      "Qoplama maydoni va turi, yuvish postlari soni, ulanish nuqtasidagi kanalizatsiya belgisi. Hisobiy sarf hisobi, o‘lcham tanlovi va qurilish qismi uchun o‘rnatish sxemasini qaytaramiz.",
    ctaButton: "TANLOVNI SO‘RASH",
    related: {
      title: "Yaqin liniyalar va yechimlar",
      links: [
        { href: "/products/peskolovka", label: "Qum tutgichlar" },
        { href: "/products/zhiroulovitel", label: "Yog‘ tutgichlar" },
        { href: "/products/los-bio", label: "LOS BIO" },
        { href: "/solutions/car-wash", label: "Avtoyuvish uchun tozalash" },
        {
          href: "/solutions/gas-station",
          label: "ShAQSh uchun neft tutgich",
        },
        { href: "/products", label: "Butun assortiment" },
      ],
    },
  },

  en: {
    label: "OIL SEPARATORS",
    title: "Oil separators\nfrom 1.5 to 50 l/s.",
    intro:
      "A gravity oil separator for the outlet of a car wash, filling station, parking deck or industrial yard. Nine sizes from НЕФ-1.5 to НЕФ-50 — 1.5 to 50 l/s (5.4–180 m³/h). Filament-wound fiberglass shell, gravity operation, no power and no consumables. Manufactured in Tashkent.",
    sections: [
      {
        title: "Where an oil separator is needed",
        text: [
          "Oil separator, oil interceptor, petrol and oil separator — the same unit under different names. It goes wherever fuel and oil reach the pavement: car washes, filling stations, open and underground parkings, service stations, truck depots and industrial yards. A separate case is stormwater treatment: rain washes off everything accumulated between events and delivers it to one outlet within minutes.",
          "Oil products are regulated at the discharge point. Resolution No. 11 of the Cabinet of Ministers of Uzbekistan, 03.02.2010, sets the limit at 1.0 mg/l, and both a connection to the city sewer and a discharge to ground or a water body are judged against that figure.",
          "The second reason is biology. An oil film blocks oxygen transfer and suppresses activated sludge, so a slug of oil knocks out the biological stage of a package plant or a municipal works for weeks. The separator therefore always sits upstream of biological treatment, never after it.",
        ],
      },
      {
        title: "How a size is selected",
        text: [
          "Selection is by peak flow in litres per second, as in EN 858-2: НЕФ-10 means 10 l/s, that is 36 m³/h. For stormwater the flow comes from the catchment area and the design rainfall intensity to KMK 2.04.03-19; for a car wash, from the number of bays working at the same time — one high-pressure unit gives 1.2–1.8 m³/h. Sizing by the diameter of the existing pipe is wrong by a factor, in either direction.",
          "The train is then built up: a sand trap where the yard produces abrasives, a settling zone for coarse droplets, a coalescing lamella module at 20 mm plate spacing, and a sorption filter after the separator where the discharge limit is tight. The range is calculated from droplet rise velocity: 2.58 m/h for a 100 µm droplet at 850 kg/m³ and 15 °C, while the specific load on the effective area is set at 1.72 m/h across the range — a safety factor of 1.5.",
          "Two things decide the layout early. Storm peaks: the separator is sized for the design flow, so a bypass or a flow splitter carries the excess past the unit. And levels: the unit works by gravity, so the shell height (1300 mm on НЕФ-1.5 up to 2100 mm on НЕФ-50) plus the pipe gradients must fit between the incoming invert and the connection point.",
        ],
      },
      {
        title: "Construction and maintenance",
        text: [
          "The shell is filament-wound fiberglass on isophthalic polyester resin with stiffening ribs; laminate thickness runs from 6 mm on the small sizes to 10 mm on НЕФ-50. Fiberglass does not corrode or degrade in contact with petrol, diesel and oils. Dry mass is 100 kg for НЕФ-1.5 and 1055 kg for НЕФ-50. Installation is buried, in a concrete surround; where groundwater is high the shell is checked for buoyancy and the anchoring calculation is supplied with the passport.",
          "Two fractions accumulate in service: heavy sludge in the sludge trap chamber, sized at 200 litres per 1 l/s of design flow, and floating oil in the upper zone, at 15 litres per 1 l/s. Both are removed by vacuum truck — the only routine operation. No power, reagents or replacement cartridges are required.",
          "The interval depends on the site: a busy car wash is checked far more often than a parking deck. The maintenance schedule supplied with the unit sets the starting point and is adjusted after the first months of measurements. Coalescing packs lift out through the hatches and are washed with water. A pack blinded with sand is the most common cause of falling performance, which is why a separate sand trap goes upstream where abrasive load is high.",
        ],
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "How is an oil separator different from a grease trap?",
        a: "By duty and by physics. A grease trap handles vegetable and animal fats from kitchen wastewater — light, sticky, congealing on the walls. An oil separator handles mineral oil products: petrol, diesel, lubricants, with a different density, a different rise velocity and a coalescing lamella module inside that a grease trap does not have. Neither can substitute for the other.",
      },
      {
        q: "Is a sand trap needed upstream?",
        a: "The unit already has a sludge trap chamber of 200 litres per 1 l/s, which is usually enough for a parking deck or a filling station. A separate sand trap is needed where sand load is high — car washes, construction sites, unpaved approaches. Abrasive blinds the lamella pack and turns maintenance into a monthly job.",
      },
      {
        q: "How often does it need servicing?",
        a: "Two routine operations: measuring the floating oil layer and the sludge level, and pumping out when accumulation approaches the design volume (15 litres per 1 l/s of oil, 200 litres per 1 l/s of sludge). The interval is tied to the measurement, not the calendar. Coalescing packs are washed during the pump-out.",
      },
      {
        q: "Can it be installed under a traffic area?",
        a: "Yes, on two conditions: a reinforced concrete load-distributing slab above the shell, and hatches rated for the traffic class. The slab, the concrete surround and the earthworks are not part of the supply — that is the civil scope — but the installation drawing with loads comes with the unit.",
      },
      {
        q: "What documents do you provide?",
        a: "Process calculation (design flow, effective area, specific load), product passport, installation drawing, soil load and buoyancy calculation, operation manual and maintenance schedule. The calculation is open and can be handed to your designer and to the review authority.",
      },
    ],
    ctaTitle: "Send the site plan —\nget a selection.",
    ctaText:
      "Paved area and surface types, number of wash bays, sewer invert at the connection point. We return the design flow calculation, the selected size and an installation drawing for the civil works.",
    ctaButton: "REQUEST A SELECTION",
    related: {
      title: "Related lines and solutions",
      links: [
        { href: "/products/peskolovka", label: "Sand traps" },
        { href: "/products/zhiroulovitel", label: "Grease traps" },
        { href: "/products/los-bio", label: "Package plants" },
        { href: "/solutions/car-wash", label: "Car wash water treatment" },
        {
          href: "/solutions/gas-station",
          label: "Oil separator for a filling station",
        },
        { href: "/products", label: "Full range" },
      ],
    },
  },

  zh: {
    label: "隔油除油器",
    title: "隔油除油器\n1.5 至 50 l/s。",
    intro:
      "用于洗车场、加油站、停车场和工业场地排水出口的重力式除油器。НЕФ-1.5 至 НЕФ-50 共九个规格，1.5 至 50 l/s（5.4–180 m³/h）。玻璃钢缠绕壳体，重力自流运行，无需供电和耗材。塔什干生产。",
    sections: [
      {
        title: "哪些场所需要除油器",
        text: [
          "除油器、油水分离器、隔油池指的是同一类设备。凡是场地铺面会接触燃油和润滑油的地方都需要：洗车场、加油站与加气站、露天及地下停车场、汽车维修站、车队场站和工业场地。另一类任务是雨水径流处理——降雨会把间歇期积累的油污一次性冲入同一个排水口。",
          "石油类物质在排放口受到限值约束：乌兹别克斯坦共和国内阁 2010 年 2 月 3 日第 11 号决议规定为 1.0 mg/l，接入市政管网、排入地表或水体均以此为准。",
          "第二个原因是生物处理。油膜阻断氧交换并抑制活性污泥，一次冲击性排油可使一体化设备或市政厂的生物段瘫痪数周。因此除油器始终设在生物处理之前。",
        ],
      },
      {
        title: "如何选型",
        text: [
          "按每秒升数的峰值流量选型，与 EN 858-2 一致：НЕФ-10 即 10 l/s，折合 36 m³/h。雨水径流按汇水面积和 KMK 2.04.03-19 的设计降雨强度计算；洗车场按同时作业工位数计算，一台高压清洗机为 1.2–1.8 m³/h。按现有管径选型会产生数倍误差。",
          "工艺链依次为：场地含砂量大时设沉砂池，大油滴重力分离区，板间距 20 mm 的聚结斜板模块，排放要求严格时在其后增设吸附过滤器。系列按油滴上浮速度计算：100 µm 油滴、密度 850 kg/m³、水温 15 °C 时为 2.58 m/h，全系列有效面积表面负荷取 1.72 m/h，留有 1.5 倍裕度。",
          "两点在选型阶段即决定方案。暴雨峰值：设备按设计流量选型，超量部分经旁通或分流井绕过设备。标高：设备重力运行，壳体高度（НЕФ-1.5 为 1300 mm，НЕФ-50 为 2100 mm）连同管道坡度必须容纳在进水管底与接入点标高之间。",
        ],
      },
      {
        title: "结构与维护",
        text: [
          "壳体为异酞酸聚酯树脂缠绕玻璃钢并设加强筋，层压厚度小规格 6 mm 至 НЕФ-50 的 10 mm。玻璃钢与汽油、柴油和润滑油接触不腐蚀、不劣化。干重从 НЕФ-1.5 的 100 kg 到 НЕФ-50 的 1055 kg。埋地安装于混凝土包覆内；地下水位高时按抗浮校核，锚固计算随产品合格证提供。",
          "运行中积累两种物质：重质污泥沉入沉砂集泥室（按设计流量每 1 l/s 计 200 升），浮油聚集在上部区域（每 1 l/s 计 15 升）。两者均由吸污车抽吸清除，这是唯一的常规操作，不需要供电、药剂或更换滤芯。",
          "清掏周期取决于对象：满负荷洗车场的检查频次远高于停车场。随货的维护规程给出起点，并按最初几个月的实测调整。聚结模块可经检修口取出用水冲洗。斜板被砂堵塞是效率下降最常见的原因，因此含砂量高时应在除油器前单设沉砂池。",
        ],
      },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        q: "除油器与隔油器（餐饮）有何区别？",
        a: "用途与物理过程不同。餐饮隔油器处理厨房废水中的动植物油脂，其质轻、黏附、易在壁面凝结；除油器处理矿物油类——汽油、柴油、润滑油，密度、上浮速度和对壳体材料的侵蚀性均不同，内部还设有隔油器所没有的聚结斜板模块。两者不可互相替代。",
      },
      {
        q: "除油器前是否必须设沉砂池？",
        a: "设备本身已含每 1 l/s 200 升的沉砂集泥室，停车场和加油站通常已足够。含砂量大的场合需单设沉砂池：洗车场、施工场地、土路进出口。砂粒堵塞斜板会降低效率并使维护变为月度作业。",
      },
      {
        q: "多久维护一次？",
        a: "常规操作有两项：测量浮油层厚度与污泥深度；当积累接近设计容积时抽吸清掏（油品每 1 l/s 15 升，污泥每 1 l/s 200 升）。周期取决于场地负荷，因此规程以实测为依据而非按日历。聚结模块在清掏时用水冲洗。",
      },
      {
        q: "可以安装在行车道下方吗？",
        a: "可以，需满足两个条件：壳体上方设钢筋混凝土卸荷板，检修井盖采用与通行车辆相符的承载等级。卸荷板、混凝土包覆和土方不在供货范围内，属于土建部分，但带荷载的安装图随设备提供。",
      },
      {
        q: "提供哪些文件？",
        a: "工艺计算书（设计流量、有效面积、表面负荷）、产品合格证、安装图、土压与抗浮计算、运行手册与维护规程。计算书公开，可提交设计单位与审查机构。",
      },
    ],
    ctaTitle: "发送场地平面图——\n我们回复选型。",
    ctaText:
      "铺面面积与类型、洗车工位数量、接入点排水管标高。我们回复设计流量计算、选定规格以及供土建使用的安装图。",
    ctaButton: "索取选型",
    related: {
      title: "相关系列与方案",
      links: [
        { href: "/products/peskolovka", label: "沉砂池" },
        { href: "/products/zhiroulovitel", label: "隔油器" },
        { href: "/products/los-bio", label: "一体化生物处理设备" },
        { href: "/solutions/car-wash", label: "洗车场水处理" },
        { href: "/solutions/gas-station", label: "加油站除油器" },
        { href: "/products", label: "全部产品" },
      ],
    },
  },
};

export default content;
