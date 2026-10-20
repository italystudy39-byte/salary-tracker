import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { Parallax } from "react-scroll-parallax";
import { ArrowRight, BarChart3, PiggyBank, Cloud, SunMoon, Wallet, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const APP_URL = "/app/";
const fmt = (n) => new Intl.NumberFormat("ru-RU").format(n) + " сум";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] } }),
};

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><Wallet className="size-4" /></span>
          Учёт
        </a>
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Возможности</a>
          <a href="#savings" className="hover:text-foreground">Копилки</a>
          <a href="#how" className="hover:text-foreground">Как начать</a>
        </nav>
        <Button asChild size="sm"><a href={APP_URL}>Открыть трекер</a></Button>
      </div>
    </header>
  );
}

// Mock 3D bar chart, the tracker's signature visual.
function Bars3D() {
  const data = [[62, 34], [78, 36], [64, 38], [96, 33], [70, 41], [100, 30]];
  const months = ["май", "июн", "июл", "авг", "сен", "окт"];
  return (
    <div className="flex h-44 items-end gap-4 px-2">
      {data.map(([inc, exp], i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-36 w-full items-end justify-center gap-1.5">
            {[["income", inc], ["expense", exp]].map(([kind, h], j) => (
              <motion.div
                key={kind}
                className="relative w-3.5 sm:w-4"
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.3 + i * 0.08 + j * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div className={`absolute inset-0 rounded-[2px] ${kind === "income" ? "bg-income" : "bg-expense"}`} />
                <div className={`absolute -right-1.5 bottom-0 top-0 w-1.5 origin-left skew-y-[-40deg] ${kind === "income" ? "bg-income/60" : "bg-expense/60"} brightness-50`} />
                <div className={`absolute -top-1.5 left-0 h-1.5 w-full origin-bottom skew-x-[-40deg] ${kind === "income" ? "bg-income" : "bg-expense"} brightness-125`} />
              </motion.div>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">{months[i]}</span>
        </div>
      ))}
    </div>
  );
}

function StatChip({ label, value, tone }) {
  const color = { income: "text-income", expense: "text-expense", save: "text-save" }[tone];
  return (
    <Card className="w-56 border-border/80 bg-card/90 shadow-2xl backdrop-blur">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 font-display text-xl tabular-nums ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Glow layers drift at different speeds */}
      <Parallax speed={-20} className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-primary/20 blur-[120px]" />
      <Parallax speed={-10} className="pointer-events-none absolute -right-32 top-40 size-[420px] rounded-full bg-save/15 blur-[120px]" />

      <div className="container relative grid gap-12 pb-24 pt-16 md:pt-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <motion.div style={{ y, opacity: fade }} initial="hidden" animate="show">
          <motion.div variants={fadeUp} custom={0}><Badge>Бесплатно · в узбекских сумах</Badge></motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="mt-6 text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
            Каждый сум <span className="text-primary">под контролем</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mt-6 max-w-xl text-lg text-muted-foreground">
            Записывайте доходы и расходы, смотрите на объёмных графиках, куда уходят деньги, и автоматически откладывайте часть каждой зарплаты в копилку.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><a href={APP_URL}>Начать бесплатно <ArrowRight /></a></Button>
            <Button asChild size="lg" variant="outline"><a href="#features">Что умеет трекер</a></Button>
          </motion.div>
        </motion.div>

        <div className="relative mx-auto w-full max-w-lg">
          <Parallax speed={6}>
            <motion.div initial={{ opacity: 0, scale: 0.94, rotateX: 12 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}>
              <Card className="border-border/80 bg-card/80 shadow-[0_40px_120px_-40px_hsl(var(--primary)/0.5)] backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription>Доходы и расходы по месяцам</CardDescription>
                </CardHeader>
                <CardContent><Bars3D /></CardContent>
              </Card>
            </motion.div>
          </Parallax>
          <Parallax speed={14} className="absolute -left-6 -top-10 hidden sm:block">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
              <StatChip label="Доходы за октябрь" value={fmt(9775000)} tone="income" />
            </motion.div>
          </Parallax>
          <Parallax speed={-6} className="absolute -bottom-10 -right-4 hidden sm:block">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.6 }}>
              <StatChip label="Отложено автоматически" value={fmt(977500)} tone="save" />
            </motion.div>
          </Parallax>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: BarChart3, title: "Объёмные графики", text: "Столбцы по месяцам и кольцо расходов по категориям. Сразу видно, где перерасход." },
  { icon: PiggyBank, title: "Копилки с целями", text: "Подушка безопасности, отпуск, ремонт. Прогресс к цели и сколько осталось." },
  { icon: Wallet, title: "Автоматическое откладывание", text: "Укажите процент, и с каждого дохода он сам уйдёт в выбранную копилку." },
  { icon: Cloud, title: "Аккаунт и синхронизация", text: "Вход по почте. Данные сохраняются на сервере и доступны с телефона и компьютера." },
  { icon: SunMoon, title: "Светлая и тёмная тема", text: "Переключается в один клик или следует за настройками системы." },
  { icon: ShieldCheck, title: "Пароли под защитой", text: "Пароли хранятся только в зашифрованном виде, сессия в защищённом cookie." },
];

function Features() {
  return (
    <section id="features" className="container scroll-mt-20 py-24">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="max-w-2xl">
        <motion.h2 variants={fadeUp} className="text-3xl font-semibold sm:text-4xl">Всё для личного бюджета</motion.h2>
        <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground">Без таблиц и формул. Добавили запись, и дашборд сам всё пересчитал.</motion.p>
      </motion.div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div key={f.title} variants={fadeUp} custom={i % 3} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} whileHover={{ y: -6 }}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <span className="mb-3 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary"><f.icon className="size-5" /></span>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription className="text-[15px] leading-relaxed">{f.text}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// The goal fills up as the section scrolls through the viewport.
function Savings() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const width = useTransform(progress, (v) => `${Math.round(Math.min(1, v) * 72)}%`);
  const target = 30000000;
  const saved = useTransform(progress, (v) => fmt(Math.round((Math.min(1, v) * 0.72 * target) / 1000) * 1000));

  return (
    <section id="savings" ref={ref} className="relative scroll-mt-20 overflow-hidden border-y border-border/60 bg-card/40 py-24">
      <Parallax speed={-8} className="pointer-events-none absolute right-0 top-0 size-[480px] rounded-full bg-save/10 blur-[120px]" />
      <div className="container relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp}><Badge className="bg-save/15 text-save">Копилки</Badge></motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="mt-5 text-3xl font-semibold sm:text-4xl">Откладывайте, не думая об этом</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 max-w-lg text-muted-foreground">
            Включите автоматическое откладывание, например 10%. Пришла зарплата 9 775 000 сум, и 977 500 сум сразу легли в «Подушку безопасности». Изменили сумму дохода, и отложенное пересчиталось само.
          </motion.p>
        </motion.div>
        <Card className="border-border/80 shadow-2xl">
          <CardHeader>
            <CardDescription>Подушка безопасности</CardDescription>
            <motion.p className="font-display text-3xl tabular-nums text-save">{saved}</motion.p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <motion.div style={{ width }} className="h-full rounded-full bg-gradient-to-r from-save/70 to-save" />
            </div>
            <p className="text-sm text-muted-foreground">цель {fmt(target)}</p>
            <div className="grid grid-cols-3 gap-3 pt-3 text-sm">
              {[["Авто 10%", "+977 500"], ["На отпуск", "+700 000"], ["Билеты", "−1 500 000"]].map(([k, v]) => (
                <div key={k} className="rounded-md bg-secondary/70 p-3">
                  <p className="text-muted-foreground">{k}</p>
                  <p className={`mt-1 font-semibold tabular-nums ${v.startsWith("−") ? "text-expense" : "text-save"}`}>{v}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

const STEPS = [
  ["Зарегистрируйтесь", "Почта и пароль, это занимает полминуты."],
  ["Добавьте доходы и расходы", "Сумма, категория, дата. Комментарий по желанию."],
  ["Смотрите и копите", "Графики обновятся сразу, а копилки начнут расти."],
];

function How() {
  return (
    <section id="how" className="container scroll-mt-20 py-24">
      <h2 className="text-3xl font-semibold sm:text-4xl">Как начать</h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map(([t, d], i) => (
          <motion.div key={t} variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
            <span className="font-display text-5xl font-bold text-primary/25">{i + 1}</span>
            <h3 className="mt-2 text-lg font-semibold">{t}</h3>
            <p className="mt-2 text-muted-foreground">{d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="container pb-24">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-card p-10 text-center sm:p-16">
        <Parallax speed={-5} className="pointer-events-none absolute -bottom-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]" />
        <h2 className="relative text-3xl font-semibold sm:text-4xl">Начните считать деньги сегодня</h2>
        <p className="relative mx-auto mt-4 max-w-md text-muted-foreground">Бесплатно, без рекламы и без установки. Работает в браузере на телефоне и компьютере.</p>
        <Button asChild size="lg" className="relative mt-8"><a href={APP_URL}>Открыть трекер <ArrowRight /></a></Button>
      </motion.div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <Savings />
        <How />
        <FinalCta />
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">Учёт доходов и расходов · {new Date().getFullYear()}</footer>
    </>
  );
}
