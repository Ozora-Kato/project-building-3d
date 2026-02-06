export const floors = [
  {
    index: 0,
    name: '1F',
    label: 'CONTACT',
    type: 'contact',
    neonColor: 0x00ff88,
    cssColor: '#00ff88',
    content: {
      title: 'CONTACT',
      subtitle: 'Get in touch with us',
      body: `お問い合わせはこちらからお気軽にどうぞ。
プロジェクトのご相談、採用に関するお問い合わせなど、何でもお待ちしております。`,
      bullets: [
        'プロジェクトのご相談',
        'パートナーシップについて',
        '採用に関するお問い合わせ',
        'その他のお問い合わせ',
      ],
      cta: { text: 'SEND MESSAGE', url: '#contact' },
    },
  },
  {
    index: 1,
    name: '2F',
    label: 'COMPANY',
    type: 'company',
    neonColor: 0x00aaff,
    cssColor: '#00aaff',
    content: {
      title: 'COMPANY',
      subtitle: 'Corporate Information',
      body: `私たちは、テクノロジーとクリエイティビティの融合を通じて、
デジタル体験の未来を創造する会社です。`,
      bullets: [
        '会社名：PROJECT Inc.',
        '設立：2020年',
        '所在地：東京都渋谷区',
        '代表取締役：山田 太郎',
      ],
    },
  },
  {
    index: 2,
    name: '3F',
    label: 'RECRUITMENT',
    type: 'careers',
    neonColor: 0x00ff88,
    cssColor: '#00ff88',
    content: {
      title: 'RECRUITMENT',
      subtitle: 'Join our team',
      body: `私たちは、Webの未来を共に創る仲間を探しています。
既存の枠にとらわれない発想と、技術への情熱を持つ方をお待ちしています。`,
      bullets: [
        'フロントエンドエンジニア',
        'バックエンドエンジニア',
        'UI/UXデザイナー',
        'プロジェクトマネージャー',
      ],
      cta: { text: 'VIEW OPENINGS', url: '#careers' },
    },
  },
  {
    index: 3,
    name: '4F',
    label: 'MEMBERS',
    type: 'team',
    neonColor: 0x00aaff,
    cssColor: '#00aaff',
    content: {
      title: 'MEMBERS',
      subtitle: 'The people behind the vision',
      members: [
        { name: 'Tanaka Yuki', role: 'CEO / Founder', initial: 'T' },
        { name: 'Suzuki Aoi', role: 'CTO', initial: 'S' },
        { name: 'Yamamoto Ren', role: 'Lead Designer', initial: 'Y' },
        { name: 'Watanabe Hana', role: 'Lead Engineer', initial: 'W' },
        { name: 'Ito Kaito', role: 'PM', initial: 'I' },
        { name: 'Nakamura Saki', role: 'Designer', initial: 'N' },
      ],
    },
  },
  {
    index: 4,
    name: '5F',
    label: 'CASE STUDY',
    type: 'casestudy',
    neonColor: 0xff4444,
    cssColor: '#ff4444',
    content: {
      title: 'CASE STUDY',
      subtitle: 'Deep dive into our process',
      body: `クライアントの課題を深く理解し、テクノロジーとデザインの力で解決する。
ここでは代表的なプロジェクトの裏側をご紹介します。`,
      bullets: [
        'リサーチ → プロトタイプ → イテレーションの高速サイクル',
        'ユーザーテストに基づくデータドリブン設計',
        'パフォーマンス最適化：Lighthouse 95+ を全案件で達成',
        'アクセシビリティ（WCAG 2.1 AA準拠）',
      ],
    },
  },
  {
    index: 5,
    name: '6F',
    label: 'PoC',
    type: 'service',
    neonColor: 0xff00ff,
    cssColor: '#ff00ff',
    content: {
      title: 'PoC',
      subtitle: 'Proof of Concept',
      body: `アイデアを素早く形にし、検証する。
最新技術を活用したプロトタイプ開発で、ビジネスの可能性を実証します。`,
      bullets: [
        '高速プロトタイピング',
        '技術検証・フィージビリティスタディ',
        'MVP開発支援',
        'ユーザー検証・フィードバック分析',
      ],
    },
  },
  {
    index: 6,
    name: '7F',
    label: 'DX UNIT',
    type: 'service',
    neonColor: 0xff00ff,
    cssColor: '#ff00ff',
    content: {
      title: 'DX UNIT',
      subtitle: 'Digital Transformation',
      body: `企業のデジタル変革を包括的に支援。
戦略立案から実装、運用まで一気通貫でサポートします。`,
      bullets: [
        'DX戦略策定・ロードマップ設計',
        'レガシーシステム刷新',
        'クラウド移行・最適化',
        '業務プロセス自動化',
      ],
    },
  },
  {
    index: 7,
    name: '8F',
    label: 'Dr.CMO',
    type: 'service',
    neonColor: 0xff00ff,
    cssColor: '#ff00ff',
    content: {
      title: 'Dr.CMO',
      subtitle: 'Chief Marketing Officer as a Service',
      body: `マーケティング戦略の立案から実行まで、
CMOの視点でビジネス成長を加速させます。`,
      bullets: [
        'マーケティング戦略立案',
        'ブランディング支援',
        'デジタルマーケティング施策',
        'データ分析・KPI設計',
      ],
    },
  },
  {
    index: 8,
    name: '',
    label: 'PROJECT GROUP',
    type: 'about',
    neonColor: 0xffffff,
    cssColor: '#ffffff',
    content: {
      title: 'PROJECT GROUP',
      subtitle: 'Mission · Vision · Values',
      body: `私たちはWebを「情報の集合」ではなく「探索可能な空間」として再定義します。

MISSION — テクノロジーとクリエイティビティの境界を溶かし、人々の想像を超える体験を創出する。

VISION — すべてのデジタル接点が、訪れる価値のある「場所」になる世界。

VALUES —
・Explore Beyond — 既知の外へ踏み出す勇気
・Craft with Care — 細部に宿る品質への執着
・Build Together — 多様な視点が交差する場をつくる`,
    },
  },
];
