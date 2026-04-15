import { PageStatus, PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ── Вспомогательные функции ───────────────────────────────────────────────────

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Запуск seed...\n')

  // ── 1. Пользователи ────────────────────────────────────────────────────────

  const [passwordHash, adminHash] = await Promise.all([
    bcrypt.hash('user123', 10),
    bcrypt.hash('admin123', 10),
  ])

  const [admin, moderator, alice, bob, carol] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@cms.local' },
      update: {},
      create: {
        email: 'admin@cms.local',
        username: 'admin',
        passwordHash: adminHash,
        role: Role.ADMIN,
        bio: 'Администратор платформы',
      },
    }),
    prisma.user.upsert({
      where: { email: 'moderator@cms.local' },
      update: {},
      create: {
        email: 'moderator@cms.local',
        username: 'moderator',
        passwordHash,
        role: Role.MODERATOR,
        bio: 'Модератор сообщества. Слежу за порядком 🛡️',
      },
    }),
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        email: 'alice@example.com',
        username: 'alice',
        passwordHash,
        role: Role.USER,
        bio: 'Энтузиаст технологий и любитель хорошего кофе ☕',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        email: 'bob@example.com',
        username: 'bob',
        passwordHash,
        role: Role.USER,
        bio: 'Разработчик, геймер, иногда фотограф 📷',
      },
    }),
    prisma.user.upsert({
      where: { email: 'carol@example.com' },
      update: {},
      create: {
        email: 'carol@example.com',
        username: 'carol',
        passwordHash,
        role: Role.USER,
        bio: 'Путешественница и контент-мейкер 🌍',
      },
    }),
  ])

  console.log('✓ Пользователи (5 шт.):')
  console.log('   admin@cms.local       / admin123  [ADMIN]')
  console.log('   moderator@cms.local   / user123   [MODERATOR]')
  console.log('   alice@example.com     / user123   [USER]')
  console.log('   bob@example.com       / user123   [USER]')
  console.log('   carol@example.com     / user123   [USER]')

  // ── 2. Категории каталога ──────────────────────────────────────────────────

  const [catElectronics, catClothing, catSports] = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        slug: 'electronics',
        name: 'Электроника',
        type: 'catalog',
        description: 'Смартфоны, ноутбуки, гаджеты и аксессуары',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        slug: 'clothing',
        name: 'Одежда',
        type: 'catalog',
        description: 'Мужская и женская одежда на любой сезон',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: {
        slug: 'sports',
        name: 'Спорт',
        type: 'catalog',
        description: 'Спортивные товары и инвентарь для дома и зала',
      },
    }),
  ])

  const [catSmartphones, catLaptops] = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'smartphones' },
      update: {},
      create: {
        slug: 'smartphones',
        name: 'Смартфоны',
        type: 'catalog',
        parentId: catElectronics.id,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'laptops' },
      update: {},
      create: {
        slug: 'laptops',
        name: 'Ноутбуки',
        type: 'catalog',
        parentId: catElectronics.id,
      },
    }),
  ])

  console.log('✓ Категории каталога: Электроника → [Смартфоны, Ноутбуки], Одежда, Спорт')

  // ── 3. Товары ──────────────────────────────────────────────────────────────

  const productsData = [
    // Смартфоны
    {
      slug: 'smartphone-alpha-pro',
      name: 'Смартфон Alpha Pro',
      description:
        'Флагманский смартфон с камерой 108 МП, процессором нового поколения и аккумулятором 5000 мАч. Идеален для фото и работы.',
      price: 79990,
      oldPrice: 89990,
      inStock: true,
      categoryId: catSmartphones.id,
      attributes: {
        display: '6.7" AMOLED 120Hz',
        ram: '12 GB',
        storage: '256 GB',
        color: 'Чёрный',
      },
    },
    {
      slug: 'smartphone-beta-lite',
      name: 'Смартфон Beta Lite',
      description:
        'Бюджетный смартфон с хорошей автономностью и качественным дисплеем. Отличный выбор для ежедневного использования.',
      price: 19990,
      oldPrice: null,
      inStock: true,
      categoryId: catSmartphones.id,
      attributes: { display: '6.1" IPS', ram: '4 GB', storage: '64 GB', color: 'Белый' },
    },
    {
      slug: 'smartphone-gamma-ultra',
      name: 'Смартфон Gamma Ultra',
      description:
        'Премиальный смартфон с функцией спутниковой связи, титановым корпусом и новейшим чипсетом.',
      price: 129990,
      oldPrice: 139990,
      inStock: false,
      categoryId: catSmartphones.id,
      attributes: {
        display: '6.9" ProMotion OLED',
        ram: '16 GB',
        storage: '512 GB',
        color: 'Серебристый Титан',
      },
    },
    // Ноутбуки
    {
      slug: 'laptop-workstation-x1',
      name: 'Ноутбук WorkStation X1',
      description:
        'Мощный рабочий ноутбук для профессионалов. Процессор Intel Core i9, 32 ГБ ОЗУ и SSD 1 ТБ.',
      price: 149990,
      oldPrice: 169990,
      inStock: true,
      categoryId: catLaptops.id,
      attributes: {
        cpu: 'Intel Core i9-14900H',
        ram: '32 GB DDR5',
        storage: '1 TB NVMe SSD',
        display: '15.6" 4K IPS',
      },
    },
    {
      slug: 'laptop-slim-air',
      name: 'Ноутбук Slim Air',
      description: 'Ультратонкий ноутбук весом 1.2 кг. Идеален для поездок и работы в дороге.',
      price: 69990,
      oldPrice: null,
      inStock: true,
      categoryId: catLaptops.id,
      attributes: {
        cpu: 'AMD Ryzen 7 8700U',
        ram: '16 GB',
        storage: '512 GB SSD',
        display: '13.3" IPS',
        weight: '1.2 кг',
      },
    },
    // Одежда
    {
      slug: 'tshirt-classic-white',
      name: 'Футболка Classic White',
      description:
        'Базовая хлопковая футболка из 100% органического хлопка. Мягкая, дышащая, на каждый день.',
      price: 1490,
      oldPrice: 1990,
      inStock: true,
      categoryId: catClothing.id,
      attributes: {
        material: '100% органический хлопок',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
    },
    {
      slug: 'jeans-comfort-slim',
      name: 'Джинсы Comfort Slim',
      description: 'Зауженные джинсы из стрейч-денима. Удобная посадка, не сковывает движения.',
      price: 4990,
      oldPrice: 6990,
      inStock: true,
      categoryId: catClothing.id,
      attributes: { material: '98% хлопок, 2% эластан', color: 'Тёмно-синий' },
    },
    // Спорт
    {
      slug: 'yoga-mat-pro',
      name: 'Коврик для йоги Pro',
      description:
        'Профессиональный коврик для йоги из натурального каучука. Толщина 6 мм, нескользящее покрытие.',
      price: 3490,
      oldPrice: 4490,
      inStock: true,
      categoryId: catSports.id,
      attributes: { material: 'Натуральный каучук', size: '183 × 61 см', thickness: '6 мм' },
    },
    {
      slug: 'dumbbells-set-20kg',
      name: 'Набор гантелей 20 кг',
      description:
        'Разборные гантели с хромированными дисками. В наборе 2 гантели по 10 кг, стойка в комплекте.',
      price: 7990,
      oldPrice: null,
      inStock: true,
      categoryId: catSports.id,
      attributes: { weight: '20 кг (2 × 10 кг)', material: 'Хром + резина', includes: 'Стойка' },
    },
    {
      slug: 'resistance-bands-set',
      name: 'Набор резиновых эспандеров',
      description:
        '5 лент разного сопротивления для тренировок дома и в зале. Подходят для всех уровней.',
      price: 1990,
      oldPrice: 2490,
      inStock: true,
      categoryId: catSports.id,
      attributes: {
        resistance: ['5 кг', '10 кг', '15 кг', '20 кг', '25 кг'],
        material: 'Натуральный латекс',
      },
    },
  ]

  await Promise.all(
    productsData.map((p) =>
      prisma.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          slug: p.slug,
          name: p.name,
          description: p.description,
          price: p.price,
          oldPrice: p.oldPrice ?? undefined,
          inStock: p.inStock,
          categoryId: p.categoryId,
          attributes: p.attributes,
          status: PageStatus.PUBLISHED,
        },
      }),
    ),
  )

  console.log(`✓ Товары (${productsData.length} шт., все опубликованы)`)

  // ── 4. Блог ────────────────────────────────────────────────────────────────

  const [blogCatTech, blogCatLife] = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'blog-tech' },
      update: {},
      create: { slug: 'blog-tech', name: 'Технологии', type: 'blog' },
    }),
    prisma.category.upsert({
      where: { slug: 'blog-lifestyle' },
      update: {},
      create: { slug: 'blog-lifestyle', name: 'Стиль жизни', type: 'blog' },
    }),
  ])

  const tagDefs = [
    { slug: 'novosti', name: 'Новости' },
    { slug: 'obzor', name: 'Обзор' },
    { slug: 'sovety', name: 'Советы' },
    { slug: 'trendy', name: 'Тренды' },
    { slug: 'gadzhety', name: 'Гаджеты' },
    { slug: 'zdorove', name: 'Здоровье' },
    { slug: 'puteshestviya', name: 'Путешествия' },
    { slug: 'foto', name: 'Фото' },
    { slug: 'zhizn', name: 'Жизнь' },
    { slug: 'yumor', name: 'Юмор' },
  ]

  const tagMap: Record<string, number> = {}
  for (const t of tagDefs) {
    const tag = await prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t })
    tagMap[t.slug] = tag.id
  }

  const blogPostsData = [
    {
      slug: 'top-5-smartfonov-2025',
      title: 'Топ-5 смартфонов 2025 года: что выбрать?',
      excerpt: 'Разбираем лучшие смартфоны года — от флагманов до бюджетных вариантов.',
      content: `<h2>Лучшие смартфоны 2025 года</h2>
<p>Рынок смартфонов в 2025 году предлагает широкий выбор устройств на любой бюджет. Мы протестировали десятки моделей и составили список лучших.</p>
<h3>1. Смартфон Alpha Pro — лучший флагман</h3>
<p>Камера 108 МП, новейший процессор и аккумулятор 5000 мАч. Результаты тестов — на уровне лучших мировых образцов. Минус один: цена.</p>
<h3>2. Смартфон Gamma Ultra — для тех, кому нужно лучшее</h3>
<p>Титановый корпус, ProMotion-дисплей и функция спутниковой связи. Для экстремальных условий и требовательных пользователей.</p>
<h3>3. Смартфон Beta Lite — лучший бюджетник</h3>
<p>За 20 000 рублей вы получаете достойный IPS-дисплей, хорошую камеру и 2 дня автономности. Разумный выбор.</p>
<h3>Итог</h3>
<p>Выбор смартфона зависит от ваших задач и бюджета. Наш рейтинг поможет найти идеальное устройство без переплаты.</p>`,
      categoryId: blogCatTech.id,
      authorId: alice.id,
      tagSlugs: ['obzor', 'gadzhety', 'trendy'],
      publishedAt: daysAgo(25),
      comments: [
        { content: 'Отличный обзор! Именно то, что я искал перед покупкой.', authorId: bob.id },
        {
          content: 'А как дела с обновлениями? Производитель обещает поддержку 5 лет?',
          authorId: carol.id,
        },
        {
          content: 'По данным производителя — 4 года обновлений ОС и 5 лет патчей безопасности.',
          authorId: alice.id,
        },
      ],
    },
    {
      slug: 'kak-vybrat-noutbuk-dlya-raboty',
      title: 'Как выбрать ноутбук для работы в 2025 году',
      excerpt: 'Подробное руководство по выбору рабочего ноутбука с учётом задач и бюджета.',
      content: `<h2>Руководство по выбору ноутбука</h2>
<p>При выборе рабочего ноутбука важно учитывать несколько ключевых параметров: процессор, оперативная память, тип экрана и автономность.</p>
<h3>Процессор</h3>
<p>Для офисных задач достаточно Intel Core i5 или AMD Ryzen 5. Для видеомонтажа и 3D-рендеринга — i9 или Ryzen 9.</p>
<h3>Оперативная память</h3>
<p>Минимум для работы — 8 ГБ, комфортно — 16 ГБ, для профессиональных задач — 32 ГБ и выше.</p>
<h3>Аккумулятор</h3>
<p>Для работы в дороге ищите ёмкость от 60 Вт⋅ч. Slim Air держит 12 часов — рекорд в своём классе.</p>
<h3>Наш выбор</h3>
<p><strong>WorkStation X1</strong> — для профессионалов. <strong>Slim Air</strong> — для мобильных сотрудников.</p>`,
      categoryId: blogCatTech.id,
      authorId: bob.id,
      tagSlugs: ['sovety', 'gadzhety'],
      publishedAt: daysAgo(18),
      comments: [
        {
          content: 'Спасибо за подробное сравнение! Взял WorkStation X1 — доволен на 100%.',
          authorId: alice.id,
        },
        { content: 'А что насчёт MacBook? Не рассматривали в сравнении?', authorId: carol.id },
        {
          content: 'Хорошая мысль — сделаю отдельный материал по macOS vs Windows для работы.',
          authorId: bob.id,
        },
      ],
    },
    {
      slug: '10-sovetov-dlya-produktivnosti',
      title: '10 советов для повышения продуктивности',
      excerpt: 'Простые и эффективные техники, которые помогут работать умнее, а не больше.',
      content: `<h2>10 проверенных техник продуктивности</h2>
<p>Продуктивность — это не про то, чтобы работать больше. Это про то, чтобы работать умнее.</p>
<h3>1. Метод Помодоро</h3>
<p>25 минут глубокой работы, 5 минут отдыха. После 4 циклов — длинный перерыв 15-30 минут.</p>
<h3>2. Правило двух минут</h3>
<p>Если задача займёт меньше двух минут — сделайте её прямо сейчас, не откладывайте.</p>
<h3>3. Блокировка времени</h3>
<p>Распределяйте задачи по временным блокам в календаре. Это снижает переключение контекста и усталость принятия решений.</p>
<h3>4. Цифровой детокс</h3>
<p>Отключайте уведомления во время глубокой работы. Телефон — в другую комнату.</p>
<h3>5. Ритуал завершения дня</h3>
<p>Записывайте 3 главных достижения дня и план на завтра. Это помогает мозгу "отпустить" работу.</p>`,
      categoryId: blogCatLife.id,
      authorId: carol.id,
      tagSlugs: ['sovety', 'trendy'],
      publishedAt: daysAgo(12),
      comments: [
        {
          content: 'Метод Помодоро изменил мою жизнь, серьёзно. Рекомендую всем!',
          authorId: bob.id,
        },
        {
          content: 'Добавила бы ещё: утренние страницы по Джулии Кэмерон — мощная практика.',
          authorId: alice.id,
        },
      ],
    },
    {
      slug: 'trendy-fitness-2025',
      title: 'Главные фитнес-тренды 2025 года',
      excerpt: 'Какие направления спорта и здорового образа жизни стали популярными в этом году.',
      content: `<h2>Фитнес-тренды 2025</h2>
<p>Индустрия фитнеса постоянно развивается. Что актуально прямо сейчас?</p>
<h3>Функциональный тренинг</h3>
<p>Упражнения, имитирующие повседневные движения, стали ещё популярнее. Гантели, петли TRX, медицинболы.</p>
<h3>Осознанное движение</h3>
<p>Йога, медитация в движении и дыхательные практики — на пике. Коврик для йоги Pro — идеальный старт.</p>
<h3>Домашние тренировки</h3>
<p>После 2020 года домашний зал стал нормой. Набор гантелей + эспандеры заменяют полноценный зал.</p>
<h3>Зональные тренировки</h3>
<p>Тренировки с пульсометром и чёткими зонами ЧСС — более научный подход к фитнесу.</p>`,
      categoryId: blogCatLife.id,
      authorId: alice.id,
      tagSlugs: ['trendy', 'zdorove'],
      publishedAt: daysAgo(7),
      comments: [
        {
          content: 'Подтверждаю — домашние тренировки с гантелями дают отличный результат!',
          authorId: bob.id,
        },
      ],
    },
    {
      slug: 'puteshestviya-nalego-sekrety',
      title: 'Путешествия налегке: секреты опытных путешественников',
      excerpt: 'Как уместить всё необходимое в ручную кладь и путешествовать без лишнего груза.',
      content: `<h2>Как путешествовать налегке</h2>
<p>Опытные путешественники давно поняли: меньше вещей — больше свободы и удовольствия.</p>
<h3>Правило одного чемодана</h3>
<p>Возьмите только то, что можно унести одной рукой. Две руки занято — уже слишком много.</p>
<h3>Многофункциональная одежда</h3>
<p>Вещи, которые можно носить по-разному. Нейтральные цвета — всё сочетается между собой. Наша Classic White — идеальная база.</p>
<h3>Туалетные принадлежности</h3>
<p>Твёрдое мыло, шампунь в таблетках, многоразовые ватные диски — не занимают места, не протекают.</p>
<h3>Техника</h3>
<p>Один универсальный гаджет вместо пяти специализированных. Slim Air весит 1.2 кг — незаметен в рюкзаке.</p>`,
      categoryId: blogCatLife.id,
      authorId: carol.id,
      tagSlugs: ['sovety', 'puteshestviya'],
      publishedAt: daysAgo(3),
      comments: [
        {
          content: 'Попробовал твёрдый шампунь — больше к жидкому не вернусь 👍',
          authorId: alice.id,
        },
        {
          content: 'Метод "одного чемодана" меняет всё путешествие. Сам убедился!',
          authorId: bob.id,
        },
      ],
    },
  ]

  for (const post of blogPostsData) {
    const { tagSlugs, comments, ...postData } = post
    const tagIds = tagSlugs.map((s) => ({ id: tagMap[s] }))

    const blogPost = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...postData,
        status: PageStatus.PUBLISHED,
        tags: { connect: tagIds },
      },
    })

    // Комментарии к статье
    const existingCount = await prisma.comment.count({ where: { blogPostId: blogPost.id } })
    if (existingCount === 0) {
      for (const c of comments) {
        await prisma.comment.create({ data: { ...c, blogPostId: blogPost.id } })
      }
    }
  }

  console.log(
    `✓ Блог: ${blogPostsData.length} статей, категории [Технологии, Стиль жизни], 10 тегов`,
  )

  // ── 5. Форум ───────────────────────────────────────────────────────────────

  const [forumGeneral, forumHelp, forumFun] = await Promise.all([
    prisma.forumSection.upsert({
      where: { slug: 'general' },
      update: {},
      create: {
        slug: 'general',
        title: 'Общение',
        description: 'Свободное общение на любые темы',
        order: 1,
      },
    }),
    prisma.forumSection.upsert({
      where: { slug: 'help' },
      update: {},
      create: {
        slug: 'help',
        title: 'Помощь и поддержка',
        description: 'Вопросы по работе с платформой, ошибки, предложения',
        order: 2,
      },
    }),
    prisma.forumSection.upsert({
      where: { slug: 'fun' },
      update: {},
      create: {
        slug: 'fun',
        title: 'Флуд и юмор',
        description: 'Мемы, шутки, интересные находки — без строгих правил',
        order: 3,
      },
    }),
  ])

  const threadsData = [
    // Общение
    {
      slug: 'privet-vsem-ya-novenkiy',
      title: 'Привет всем! Я новенький 👋',
      sectionId: forumGeneral.id,
      authorId: alice.id,
      isPinned: true,
      posts: [
        {
          content:
            'Привет! Только зарегистрировалась, всё ещё изучаю платформу. Очень нравится дизайн и функциональность! Рада познакомиться со всеми 😊',
          authorId: alice.id,
        },
        {
          content:
            'Добро пожаловать, Alice! Здесь отличное сообщество, не стесняйся спрашивать. Если что — пиши в личку.',
          authorId: bob.id,
        },
        {
          content:
            'Привет! Раздел "Помощь и поддержка" — твой лучший друг на первое время. Там есть ответы на большинство вопросов.',
          authorId: moderator.id,
        },
        {
          content: 'Спасибо всем! Уже почитала форум — много полезного нашла ❤️ Буду активничать!',
          authorId: alice.id,
        },
      ],
    },
    {
      slug: 'kak-dela-chto-novogo',
      title: 'Как дела? Что нового?',
      sectionId: forumGeneral.id,
      authorId: bob.id,
      isPinned: false,
      posts: [
        {
          content:
            'Всем привет! Решил создать тему для неформального общения. Рассказывайте — что происходит в вашей жизни?',
          authorId: bob.id,
        },
        {
          content:
            'Неплохо! Только что купил новый ноутбук из каталога — WorkStation X1. Монстр машина, очень доволен!',
          authorId: alice.id,
        },
        {
          content: 'Я сейчас путешествую по Вьетнаму — просто шикарно тут! 🏝️🇻🇳',
          authorId: carol.id,
        },
        { content: 'Завидую, Carol! Куда дальше планируешь?', authorId: bob.id },
        {
          content: 'Пока Таиланд, потом думаю Камбоджу. Если у кого есть советы — буду рада!',
          authorId: carol.id,
        },
        {
          content:
            'В Таиланде обязательно съезди на острова Пхи-Пхи — это что-то невероятное. И попробуй уличный pad thai!',
          authorId: bob.id,
        },
      ],
    },
    {
      slug: 'obsuzhdaem-novye-produkty-kataloga',
      title: 'Обсуждаем новые товары в каталоге',
      sectionId: forumGeneral.id,
      authorId: carol.id,
      isPinned: false,
      posts: [
        {
          content:
            'Заметила что в каталоге появились новые товары. Кто-нибудь уже что-то покупал? Как впечатления?',
          authorId: carol.id,
        },
        {
          content:
            'Брал набор гантелей — качество отличное! Хром не облазит, резина не воняет. Рекомендую.',
          authorId: bob.id,
        },
        {
          content:
            'А я коврик для йоги взяла. Натуральный каучук — совсем другое ощущение по сравнению с синтетикой.',
          authorId: alice.id,
        },
      ],
    },
    // Помощь
    {
      slug: 'kak-nastroit-profil',
      title: 'Как настроить профиль и поменять аватар?',
      sectionId: forumHelp.id,
      authorId: alice.id,
      isPinned: false,
      posts: [
        {
          content:
            'Подскажите, где можно поменять аватарку и заполнить биографию? Никак не могу найти раздел настроек.',
          authorId: alice.id,
        },
        {
          content:
            'Кабинет → Профиль. Там всё есть: загрузка фото, биография, ссылки на соцсети. Не перепутай с разделом "Безопасность" — он отдельно.',
          authorId: moderator.id,
        },
        { content: 'Нашла! Всё оказалось очень просто, спасибо 😅', authorId: alice.id },
        {
          content:
            'Кстати, максимальный размер аватара — 2 МБ, форматы JPG/PNG/WEBP. Если больше — не загрузится.',
          authorId: moderator.id,
        },
      ],
    },
    {
      slug: 'oshibka-pri-vhode',
      title: 'Ошибка "Неверный пароль" — что делать?',
      sectionId: forumHelp.id,
      authorId: bob.id,
      isPinned: false,
      posts: [
        {
          content:
            'Проблема: пытаюсь войти, система пишет "неверный пароль", хотя пароль точно правильный. Пробовал сбросить — письмо не приходит уже час.',
          authorId: bob.id,
        },
        {
          content:
            'Первое — проверь папку "Спам". Второе — убедись что вводишь email, а не username. Третье — попробуй другой браузер (возможно кэш).',
          authorId: moderator.id,
        },
        { content: 'Было в спаме! Пароль сбросил, всё ок. Спасибо за помощь 👍', authorId: bob.id },
        {
          content: 'Рады помочь! Закрываю тему как решённую ✅',
          authorId: moderator.id,
        },
      ],
    },
    // Флуд и юмор
    {
      slug: 'luchshie-memy-nedeli',
      title: 'Лучшие мемы недели 🐸',
      sectionId: forumFun.id,
      authorId: carol.id,
      isPinned: true,
      posts: [
        {
          content:
            'Собираю лучшие мемы этой недели! Начну:\n\n*Программист в понедельник:* "Всё понял, переписываю с нуля!"\n*Программист в пятницу:* "Пусть работает как работает"',
          authorId: carol.id,
        },
        {
          content:
            '😂 Это слишком точно! Ещё:\n\n*Junior:* "Это невозможно исправить"\n*Senior:* [смотрит 2 минуты] "А, понял. Точка с запятой"',
          authorId: bob.id,
        },
        {
          content:
            'Мой любимый за всё время: "Git blame показывает что этот ужасный код написал я же год назад"',
          authorId: alice.id,
        },
        {
          content: 'Или: "Works on my machine" → "Then we ship your machine" 😂',
          authorId: moderator.id,
        },
      ],
    },
    {
      slug: 'zagadki-i-golovolomki',
      title: 'Загадки и головоломки — отдыхаем мозгом 🧩',
      sectionId: forumFun.id,
      authorId: bob.id,
      isPinned: false,
      posts: [
        {
          content:
            'Загадка дня:\nЧем больше берёшь — тем больше становится. Что это?\n\n_(отвечайте в следующем сообщении, не подглядывайте!)_',
          authorId: bob.id,
        },
        { content: 'Яма! 🕳️', authorId: carol.id },
        { content: 'Правильно! Твоя очередь 🎯', authorId: bob.id },
        { content: 'Что идёт, не двигаясь с места?', authorId: carol.id },
        { content: 'Время! ⏰ Моя любимая загадка!', authorId: alice.id },
        {
          content:
            'Верно! Следующая: У меня есть города, но нет домов. Есть горы, но нет деревьев. Есть вода, но нет рыбы. Что я?',
          authorId: carol.id,
        },
        { content: 'Карта! 🗺️', authorId: bob.id },
      ],
    },
  ]

  for (const thread of threadsData) {
    const { posts, ...threadData } = thread

    let forumThread = await prisma.forumThread.findUnique({ where: { slug: thread.slug } })
    if (!forumThread) {
      forumThread = await prisma.forumThread.create({
        data: { ...threadData, lastPostAt: new Date() },
      })
    }

    const existingPostsCount = await prisma.forumPost.count({ where: { threadId: forumThread.id } })
    if (existingPostsCount === 0) {
      for (const post of posts) {
        await prisma.forumPost.create({
          data: { ...post, threadId: forumThread.id },
        })
      }
    }
  }

  console.log(
    `✓ Форум: 3 раздела [Общение, Помощь, Флуд], ${threadsData.length} тем, ${threadsData.reduce((s, t) => s + t.posts.length, 0)} сообщений`,
  )

  // ── 6. Грам ────────────────────────────────────────────────────────────────

  const gramPostsData = [
    {
      content:
        'Только что получил новый ноутбук WorkStation X1 из каталога! Распаковка — лучший момент в жизни любого техногика 🎉 Производительность зашкаливает #гаджеты #unboxing',
      authorId: bob.id,
      tagSlugs: ['gadzhety'],
      likerIds: [alice.id, carol.id, moderator.id],
      comments: [
        { content: 'О, это же WorkStation X1? Как ощущения? 👀', authorId: alice.id },
        {
          content: 'Слюни текут 🤤 Как производительность в реальных задачах?',
          authorId: carol.id,
        },
        {
          content: 'Монстр! Открыл 50 вкладок + 3 проекта в IDE — даже не почувствовал.',
          authorId: bob.id,
        },
      ],
    },
    {
      content:
        'Утренняя йога на рассвете — лучшее начало дня ☀️🧘‍♀️ Уже 3 месяца каждое утро. Коврик Pro из каталога — просто идеальный, нога не скользит даже при интенсивной практике #йога #здоровье #утро',
      authorId: alice.id,
      tagSlugs: ['foto', 'zdorove'],
      likerIds: [bob.id, carol.id, admin.id],
      comments: [
        { content: 'Красота! В какое время встаёшь?', authorId: carol.id },
        {
          content: 'В 6 утра! Поначалу сложно, но через неделю тело само просыпается 💪',
          authorId: alice.id,
        },
        { content: 'Мне бы такую силу воли... 😅 Уже пробовала пять раз начать', authorId: bob.id },
        { content: 'Начни с 10 минут. Буквально 10 минут!', authorId: alice.id },
      ],
    },
    {
      content:
        'Вьетнам — это не только фо-бо и фотогеничные улочки. Это прежде всего самые добрые и открытые люди в мире 🇻🇳❤️ Хой Ан ночью — это магия. #путешествия #вьетнам #азия',
      authorId: carol.id,
      tagSlugs: ['foto', 'puteshestviya'],
      likerIds: [alice.id, bob.id, admin.id, moderator.id],
      comments: [
        { content: 'Завидую белой завистью! 😍 Давно хочу в Азию', authorId: alice.id },
        { content: 'Хой Ан правда топ. Ты была на Ко Хой?', authorId: bob.id },
        { content: 'Нет, это где? Добавляю в список!', authorId: carol.id },
        {
          content: 'Маленький остров рядом с городом. Абсолютно нетуристический, дикая красота.',
          authorId: bob.id,
        },
      ],
    },
    {
      content:
        'Когда код работает с первого раза в пятницу вечером 🎊\n\nЯ: "Это невозможно"\nКод: "Держи"\n\nТрогать не буду. Коммичу. Ухожу. #программирование #юмор #пятница',
      authorId: bob.id,
      tagSlugs: ['yumor'],
      likerIds: [alice.id, moderator.id, carol.id],
      comments: [
        { content: '😂 Такое бывает раз в году', authorId: alice.id },
        { content: 'Сразу в прод! Ничего не трогать! 🤣', authorId: moderator.id },
        { content: 'Git commit -m "magic" и убегать', authorId: carol.id },
      ],
    },
    {
      content:
        'Новая белая футболка Classic из каталога — уже две недели ношу почти каждый день. Органический хлопок — совсем другое ощущение, не сравнить с обычным синтетиком 🤍 #мода #минимализм #качество',
      authorId: alice.id,
      tagSlugs: ['foto', 'zhizn'],
      likerIds: [carol.id, bob.id, moderator.id],
      comments: [
        { content: 'Смотрится очень чисто и стильно! Беру тоже', authorId: carol.id },
        { content: 'Ещё раз убеждаюсь что базовые вещи — лучшая инвестиция', authorId: alice.id },
      ],
    },
    {
      content:
        'Дождливое воскресенье = лучшее время для книги и горячего чая ☕📚\n\nЧто сейчас читаете? Делитесь! Ищу следующую книгу #книги #уют #воскресенье',
      authorId: carol.id,
      tagSlugs: ['zhizn'],
      likerIds: [alice.id, bob.id, moderator.id, admin.id],
      comments: [
        { content: '"Мастер и Маргарита" в 10-й раз — классика не стареет!', authorId: alice.id },
        { content: 'Сейчас "Атлант расправил плечи" — захватывающе и длинно 😅', authorId: bob.id },
        {
          content: 'Лю Цысинь "Задача трёх тел" — обязательно! Голова взрывается.',
          authorId: moderator.id,
        },
        {
          content: 'О, "Задача трёх тел" у меня в списке уже год — наконец начну!',
          authorId: carol.id,
        },
      ],
    },
    {
      content:
        'Первая тренировка с новым набором гантелей — ощущение победы! 💪 Дома теперь полноценный мини-зал. Никаких очередей, никаких взносов #спорт #домашнийзал #фитнес',
      authorId: bob.id,
      tagSlugs: ['zhizn', 'zdorove'],
      likerIds: [alice.id, carol.id],
      comments: [
        { content: 'Ооо, это же те гантели из каталога? Хочу тоже!', authorId: alice.id },
        { content: 'Они самые! Качество отличное, хром блестит ✨', authorId: bob.id },
      ],
    },
  ]

  for (const gramData of gramPostsData) {
    const { likerIds, comments, tagSlugs: gTagSlugs, ...postData } = gramData

    const existing = await prisma.gramPost.findFirst({
      where: { authorId: postData.authorId, content: postData.content },
    })
    if (existing) continue

    const gramPost = await prisma.gramPost.create({
      data: {
        ...postData,
        tags: { connect: gTagSlugs.map((s) => ({ id: tagMap[s] })) },
      },
    })

    // Лайки
    for (const userId of likerIds) {
      await prisma.like.upsert({
        where: { userId_gramPostId: { userId, gramPostId: gramPost.id } },
        update: {},
        create: { userId, gramPostId: gramPost.id },
      })
    }

    // Комментарии
    for (const c of comments) {
      await prisma.comment.create({ data: { ...c, gramPostId: gramPost.id } })
    }
  }

  const totalLikes = gramPostsData.reduce((s, p) => s + p.likerIds.length, 0)
  const totalComments = gramPostsData.reduce((s, p) => s + p.comments.length, 0)
  console.log(
    `✓ Грам: ${gramPostsData.length} постов, ${totalLikes} лайков, ${totalComments} комментариев`,
  )

  // ── Итог ───────────────────────────────────────────────────────────────────

  console.log('\n🎉 Seed завершён успешно!\n')
  console.log('── Аккаунты ─────────────────────────────────────────')
  console.log('  admin@cms.local       / admin123  [ADMIN]')
  console.log('  moderator@cms.local   / user123   [MODERATOR]')
  console.log('  alice@example.com     / user123   [USER]')
  console.log('  bob@example.com       / user123   [USER]')
  console.log('  carol@example.com     / user123   [USER]')
  console.log('─────────────────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Seed завершился с ошибкой:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
