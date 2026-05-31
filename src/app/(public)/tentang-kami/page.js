import styles from "./page.module.css";
import ScrollReveal from "@/components/ScrollReveal";
import LogoWall from "@/components/LogoWall";

export const metadata = {
  title: "Tentang Kami - Prime Property",
  description: "Profil, visi, misi, dan nilai-nilai utama Prime Property.",
};

const stats = [
  { label: "Proyek Selesai", value: "12+" },
  { label: "Unit Terjual", value: "450+" },
  { label: "Kepuasan Klien", value: "98%" },
  { label: "Tahun Pengalaman", value: "8+" }
];

const team = [
  {
    name: "Restu Satrio Pinanggih",
    role: "Direktur Utama",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=500&auto=format&fit=crop&fm=webp"
  },
  {
    name: "Amanda Putri",
    role: "Kepala Penjualan",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=500&auto=format&fit=crop&fm=webp"
  },
  {
    name: "Dimas Anggara",
    role: "Senior Property Consultant",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=500&auto=format&fit=crop&fm=webp"
  },
  {
    name: "Siti Rahma",
    role: "Legal Specialist",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=500&auto=format&fit=crop&fm=webp"
  }
];

const timeline = [
  { year: "2018", title: "Awal Berdiri", desc: "Prime Property resmi didirikan dengan fokus pada ruko komersial di Medan." },
  { year: "2020", title: "Ekspansi Villa", desc: "Mulai merambah ke segmen villa mewah di kawasan Deli Serdang." },
  { year: "2022", title: "Digital Transformation", desc: "Meluncurkan platform pencarian properti digital untuk memudahkan klien." },
  { year: "2026", title: "Market Leader", desc: "Menjadi salah satu agensi properti premium terkemuka di Sumatera Utara." }
];

const partnerLogos = [
  { altText: "AREBI" },
  { altText: "BCA" },
  { altText: "MANDIRI" },
  { altText: "CIPUTRA" },
  { altText: "AGUNG PODOMORO" },
  { altText: "BTN" },
  { altText: "REI" },
  { altText: "SINARMAS LAND" }
];

export default function TentangKamiPage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <ScrollReveal>
          <span className={styles.subtitle}>Profil Perusahaan</span>
          <h1 className={styles.title}>Tentang Kami</h1>
        </ScrollReveal>
      </div>

      {/* Intro Section - 2 Columns */}
      <section className={styles.introSection}>
        <div className={styles.introText}>
          <ScrollReveal direction="left">
            <p>
              <strong>Prime Property</strong> berdiri sebagai agen properti terpercaya yang berfokus pada penyediaan unit hunian villa eksklusif dan ruko komersial berkualitas tinggi. Kami berkomitmen untuk menjembatani impian Anda memiliki properti bernilai investasi tinggi dengan pelayanan profesional, jujur, dan transparan.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="left" delay={0.2}>
            <p>
              Dengan didukung oleh tim agen berlisensi dan berpengalaman di industri real estate Indonesia, kami tidak hanya menawarkan sekadar tempat tinggal atau ruang usaha, melainkan sebuah masa depan finansial dan kenyamanan hidup yang berkelanjutan. Setiap listing kami pilih dengan kurasi ketat guna memastikan legalitas aman dan kualitas bangunan yang terjaga.
            </p>
          </ScrollReveal>
        </div>
        <div className={styles.introVisual}>
          <ScrollReveal direction="right">
            <p className={styles.quote}>
              &ldquo;Komitmen kami adalah menghadirkan properti dengan standar kualitas tanpa kompromi, membangun hubungan jangka panjang berdasarkan integritas, dan memberikan kepuasan maksimal bagi setiap klien.&rdquo;
            </p>
            <span className={styles.quoteAuthor}>Restu Satrio Pinanggih</span>
            <span className={styles.quoteTitle}>Direktur Utama Prime Property</span>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className={styles.visionMission}>
        <ScrollReveal direction="left">
          <div className={styles.box}>
            <h2 className={styles.boxTitle}>Visi Kami</h2>
            <p>
              Menjadi platform agensi real estate premium nomor satu di Indonesia yang dikenal karena keunggulan portofolio properti ruko dan villa, keandalan sistem layanan informasi digital, serta integritas agen profesional.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal direction="right">
          <div className={styles.box}>
            <h2 className={styles.boxTitle}>Misi Kami</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                Mengurasi secara selektif properti villa dan ruko dengan kualitas konstruksi prima serta lokasi strategis.
              </li>
              <li className={styles.listItem}>
                Menyediakan platform informasi listing yang akurat, real-time, dan mudah diakses oleh calon pembeli.
              </li>
              <li className={styles.listItem}>
                Membina tim agen internal dengan pelatihan etika kerja yang tinggi untuk menjamin pelayanan yang transparan dan bebas dari praktek penipuan.
              </li>
              <li className={styles.listItem}>
                Memastikan setiap transaksi klien berjalan lancar dari proses administrasi hingga serah terima kunci.
              </li>
            </ul>
          </div>
        </ScrollReveal>
      </section>

      {/* Corporate Values Section */}
      <section className={styles.valuesSection}>
        <ScrollReveal>
          <h2 className={styles.valuesTitle}>Nilai Perusahaan</h2>
        </ScrollReveal>
        <div className={styles.valuesGrid}>
          {[
            { n: "01", t: "Integritas", d: "Kejujuran dan kepatuhan hukum adalah fondasi utama kami. Kami menjamin transparansi penuh pada setiap detail unit properti." },
            { n: "02", t: "Mutu Tinggi", d: "Kami hanya memasarkan properti ruko dan villa yang memenuhi kualifikasi mutu desain, struktur, dan lokasi prima." },
            { n: "03", t: "Fokus Klien", d: "Kebutuhan dan kenyamanan klien adalah prioritas teratas kami. Kami mendengarkan dan mencarikan solusi properti terbaik." },
            { n: "04", t: "Inovasi", d: "Kami menerapkan teknologi digital untuk mengelola listing properti secara rapi guna memudahkan pencarian data real-time." }
          ].map((v, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className={styles.valueCard}>
                <div className={styles.valueNumber}>{v.n}</div>
                <h3 className={styles.valueName}>{v.t}</h3>
                <p className={styles.valueDesc}>{v.d}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <ScrollReveal>
          <h2 className={styles.teamTitle}>Tim Profesional Kami</h2>
        </ScrollReveal>
        <div className={styles.teamGrid}>
          {team.map((member, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className={styles.teamCard}>
                <div 
                  className={styles.teamImage} 
                  style={{ backgroundImage: `url(${member.image})` }}
                />
                <div className={styles.teamInfo}>
                  <h4 className={styles.memberName}>{member.name}</h4>
                  <p className={styles.memberRole}>{member.role}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className={styles.timelineSection}>
        <ScrollReveal>
          <h2 className={styles.timelineTitle}>Perjalanan Kami</h2>
        </ScrollReveal>
        <div className={styles.timeline}>
          {timeline.map((item, i) => (
            <div key={i} className={`${styles.timelineItem} ${i % 2 === 0 ? styles.left : styles.right}`}>
              <ScrollReveal direction={i % 2 === 0 ? "left" : "right"}>
                <div className={styles.timelineContent}>
                  <span className={styles.timelineYear}>{item.year}</span>
                  <h4 style={{ marginBottom: "10px" }}>{item.title}</h4>
                  <p style={{ fontSize: "14px", color: "var(--color-gray-600)" }}>{item.desc}</p>
                </div>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Partners Section */}
      <section className={styles.partnersSection}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span className={styles.subtitle}>Didukung & Terpercaya Oleh</span>
          </div>
        </ScrollReveal>
        <div style={{ marginTop: "20px" }}>
          <LogoWall 
            items={partnerLogos} 
            speed={25} 
            pauseOnHover={true}
            logoHeight="30px"
            gap="5rem"
          />
        </div>
      </section>
    </div>
  );
}
