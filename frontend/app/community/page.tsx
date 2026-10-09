'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import { useAppSettings } from '@/components/providers/app-settings-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const posts = [
  {
    name: 'Maya Chen',
    handle: '@mayawanders',
    avatar: 'MC',
    location: 'Lofoten Islands, Norway',
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85',
    titleKey: 'community.postQuietTitle',
    textKey: 'community.postQuietText',
    likes: 248,
    comments: 32,
    tagKey: 'community.hiddenGem',
  },
  {
    name: 'Elias Morgan',
    handle: '@eliasexplores',
    avatar: 'EM',
    location: 'Kyoto, Japan',
    time: '5h ago',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85',
    titleKey: 'community.postKyotoTitle',
    textKey: 'community.postKyotoText',
    likes: 183,
    comments: 18,
    tagKey: 'community.localTip',
  },
]

const circles = ['community.slowTravel', 'community.mountainWeekends', 'community.foodTrips']

export default function CommunityPage() {
  const { t } = useAppSettings()
  const [liked, setLiked] = useState<string[]>([])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="border-b border-border bg-secondary/50 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <Users className="size-4" /> {t('community.eyebrow') || 'Traveler Stories & Tips'}
              </span>
              <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-6xl text-balance">
                {t('community.title') || 'Stories from fellow explorers'}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {t('community.intro') || 'Read genuine recommendations, secret spots, and travel memories shared by the community.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 transition"
                >
                  <Plus className="size-4" /> {t('community.shareStory') || 'Share Your Story'}
                </button>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-xs font-bold hover:bg-muted transition"
                >
                  <Sparkles className="size-4 text-primary" /> {t('community.findInspiration') || 'Find Inspiration'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feed & Sidebar Grid */}
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1fr_320px] lg:px-8 lg:py-16">
          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {t('community.fromCommunity') || 'Recent Posts'}
                </span>
                <h2 className="mt-1 font-serif text-2xl font-bold">{t('community.fresh') || 'Fresh Stories'}</h2>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
                <Search className="size-4 text-primary" />
                <span>{t('community.searchStories') || 'Search stories...'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {posts.map((post) => {
                const isLiked = liked.includes(post.name)
                return (
                  <article
                    key={post.name}
                    className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={post.image}
                        alt={t(post.titleKey) || post.name}
                        className="size-full object-cover transition duration-700 hover:scale-105"
                      />
                      <span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs font-bold text-foreground backdrop-blur-md">
                        {t(post.tagKey) || 'Travel Tip'}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                            {post.avatar}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-foreground">{post.name}</p>
                            <p className="text-xs text-muted-foreground">{post.handle} · {post.time}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="rounded-full bg-secondary px-3.5 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition"
                        >
                          {t('community.follow') || 'Follow'}
                        </button>
                      </div>

                      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 text-primary" /> {post.location}
                      </p>

                      <h3 className="mt-2 font-serif text-2xl font-bold">{t(post.titleKey)}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(post.textKey)}</p>

                      <div className="mt-6 flex items-center gap-6 border-t border-border pt-4 text-xs font-medium text-muted-foreground">
                        <button
                          type="button"
                          onClick={() =>
                            setLiked((current) =>
                              isLiked ? current.filter((name) => name !== post.name) : [...current, post.name]
                            )
                          }
                          aria-pressed={isLiked}
                          className={`flex items-center gap-1.5 transition ${
                            isLiked ? 'text-rose-500 font-bold' : 'hover:text-foreground'
                          }`}
                        >
                          <Heart className={`size-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                          <span>{post.likes + (isLiked ? 1 : 0)}</span>
                        </button>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="size-4 text-primary" />
                          <span>{post.comments} comments</span>
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold">{t('community.trending') || 'Travel Circles'}</h3>
                <span className="text-xs font-bold text-primary cursor-pointer hover:underline">
                  {t('community.seeAll') || 'See all'}
                </span>
              </div>
              <div className="mt-5 flex flex-col gap-4">
                {circles.map((key, index) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <Users className="size-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">{t(key)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {[1240, 864, 712][index].toLocaleString()} {t('community.members') || 'members'}
                      </p>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles className="size-6 text-amber-300" />
              <h3 className="mt-3 font-serif text-xl font-bold">{t('community.perspective') || 'Share Your Journey'}</h3>
              <p className="mt-2 text-xs leading-relaxed text-primary-foreground/80">
                {t('community.perspectiveIntro') || 'Have photos or advice about a recent trip? Inspire thousands of travelers.'}
              </p>
              <button
                type="button"
                className="mt-5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-primary hover:bg-white/90 transition shadow-sm"
              >
                {t('community.createPost') || 'Create Post'}
              </button>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  )
}