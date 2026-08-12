import { Link } from 'react-router-dom'
import { ArrowLeft, Dumbbell, Camera, TrendingDown, ListChecks, Users, CalendarRange } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { PlateGlyph } from '@/components/pt/PlateGlyph'
import { PRBadge } from '@/components/pt/PRBadge'
import { OfflineBanner } from '@/components/pt/OfflineBanner'
import { ConfidenceTag } from '@/components/pt/ConfidenceTag'
import { CoachNote } from '@/components/pt/CoachNote'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-eyebrow uppercase text-ink-soft">{title}</h2>
      {children}
    </section>
  )
}

function Swatch({ name, varName, textOn = 'text-ink' }: { name: string; varName: string; textOn?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`flex h-14 items-end rounded-sm border-2 border-ink p-1.5 text-label uppercase ${textOn}`}
        style={{ background: `hsl(var(${varName}))` }}
      >
        {name}
      </div>
      <code className="text-[11px] text-ink-faint">{varName}</code>
    </div>
  )
}

export function ComponentLibrary() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Back to prototype menu
      </Link>

      <p className="text-eyebrow uppercase text-primary">Focus PT</p>
      <h1 className="mt-1.5 font-display text-display-lg">Component library</h1>
      <p className="mt-2 max-w-lg text-body-lg text-ink-soft">
        Every primitive in every state — Iron &amp; Chalk. Restyled shadcn/ui base plus the Focus PT signature set.
      </p>

      <div className="mt-10 flex flex-col gap-12">
        <Section title="Colour">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            <Swatch name="Background" varName="--background" />
            <Swatch name="Surface" varName="--surface" />
            <Swatch name="Ink" varName="--ink" textOn="text-background" />
            <Swatch name="Primary — iron" varName="--primary" textOn="text-primary-foreground" />
            <Swatch name="Accent — brass" varName="--accent" textOn="text-accent-foreground" />
            <Swatch name="Success" varName="--success" textOn="text-success-foreground" />
            <Swatch name="Warning" varName="--warning" />
            <Swatch name="Destructive — rust" varName="--destructive" textOn="text-destructive-foreground" />
            <Swatch name="Border subtle" varName="--border-subtle" />
          </div>
        </Section>

        <Section title="Type scale">
          <div className="flex flex-col gap-3 rounded-md border-2 border-ink bg-surface p-4">
            <p className="font-display text-display-xl">Display XL 56</p>
            <p className="font-display text-display-lg">Display LG 40</p>
            <p className="font-display text-display-md">Display MD 28</p>
            <p className="text-heading-lg">Heading LG 24</p>
            <p className="text-heading-md">Heading MD 18</p>
            <p className="text-body-lg">Body LG 16 — the quick brown fox jumps over the lazy dog</p>
            <p className="text-body-md text-ink-soft">Body MD 14 — the quick brown fox jumps over the lazy dog</p>
            <p className="text-label uppercase text-ink-soft">Label 11 uppercase tracked</p>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="ink">Ink</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link style</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary">Default</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" size="icon" aria-label="Icon button">
              <Dumbbell className="h-5 w-5" />
            </Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="ink">Ink</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="muted">Muted</Badge>
          </div>
        </Section>

        <Section title="Inputs">
          <div className="flex max-w-xs flex-col gap-3">
            <Input placeholder="Default" />
            <Input placeholder="Focused — tab to me" autoFocus={false} />
            <Input placeholder="Disabled" disabled />
            <div className="flex items-center gap-3">
              <Switch defaultChecked />
              <span className="text-body-md">Switch — on</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch />
              <span className="text-body-md">Switch — off</span>
            </div>
          </div>
        </Section>

        <Section title="Progress">
          <div className="flex max-w-xs flex-col gap-3">
            <Progress value={28} />
            <Progress value={64} />
            <Progress value={100} />
          </div>
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="a" className="max-w-xs">
            <TabsList className="w-full">
              <TabsTrigger value="a">Meals</TabsTrigger>
              <TabsTrigger value="b">Videos</TabsTrigger>
            </TabsList>
            <TabsContent value="a">
              <p className="text-body-md text-ink-soft">Meals tab content</p>
            </TabsContent>
            <TabsContent value="b">
              <p className="text-body-md text-ink-soft">Videos tab content</p>
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Avatar">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>YA</AvatarFallback>
            </Avatar>
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-heading-sm">NK</AvatarFallback>
            </Avatar>
          </div>
        </Section>

        <Section title="Card">
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>A supporting line of description text.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body-md text-ink-soft">Card body content goes here.</p>
            </CardContent>
          </Card>
        </Section>

        <Section title="Focus PT — signature set">
          <div className="flex flex-col gap-4 rounded-md border-2 border-ink bg-surface p-4">
            <div>
              <p className="mb-2 text-body-sm font-semibold text-ink-soft">Plate glyph — reads the loaded bar at a glance</p>
              <div className="flex flex-wrap items-end gap-6">
                {[0, 42.5, 60, 100, 140, 180].map((w) => (
                  <div key={w} className="flex flex-col items-center gap-1">
                    <PlateGlyph weightKg={w} />
                    <span className="tabular text-body-sm text-ink-faint">{w}kg</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-body-sm font-semibold text-ink-soft">PR badge</p>
              <PRBadge />
            </div>
            <div>
              <p className="mb-2 text-body-sm font-semibold text-ink-soft">Confidence tags</p>
              <div className="flex flex-wrap gap-2">
                <ConfidenceTag level="high" />
                <ConfidenceTag level="medium" />
                <ConfidenceTag level="low" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-body-sm font-semibold text-ink-soft">Offline banner</p>
              <OfflineBanner pendingCount={2} />
            </div>
            <div>
              <p className="mb-2 text-body-sm font-semibold text-ink-soft">Coach note</p>
              <CoachNote from="Coach Fahad" note="Keep your chest up through the sticking point." />
            </div>
          </div>
        </Section>

        <Section title="Loading pattern">
          <p className="max-w-md text-body-md text-ink-soft">
            Skeletons echo the shape of the content they replace — same card border, same rhythm — so nothing jumps when real data lands.
          </p>
          <div className="flex flex-col gap-2.5 rounded-md border-2 border-ink bg-surface p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-md" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-14 rounded-sm" />
              <Skeleton className="h-14 rounded-sm" />
              <Skeleton className="h-14 rounded-sm" />
            </div>
          </div>
        </Section>

        <Section title="Empty states — one per screen">
          <div className="grid gap-3 sm:grid-cols-2">
            <EmptyCard
              icon={Dumbbell}
              title="No session today"
              body="Rest day. Your next session is Thursday at 6:00 PM."
              action="View program"
            />
            <EmptyCard
              icon={Camera}
              title="No meals logged yet"
              body="Snap your first meal and we'll estimate the macros for you."
              action="Snap a meal"
            />
            <EmptyCard
              icon={TrendingDown}
              title="Not enough data yet"
              body="Log two more sessions to see your strength trend."
              action="Log a session"
            />
            <EmptyCard
              icon={ListChecks}
              title="Queue clear"
              body="Nothing waiting on you right now. Nice work."
            />
            <EmptyCard
              icon={Users}
              title="No clients yet"
              body="Invite your first client to bring their training onto Focus PT."
              action="Invite a client"
            />
            <EmptyCard
              icon={CalendarRange}
              title="No program assigned"
              body="Build a program or copy one from another client to get started."
              action="Build a program"
            />
          </div>
        </Section>
      </div>
    </div>
  )
}

function EmptyCard({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ElementType
  title: string
  body: string
  action?: string
}) {
  return (
    <div className="flex flex-col items-start gap-2.5 rounded-md border-2 border-dashed border-border-subtle p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-surface-sunken">
        <Icon className="h-4.5 w-4.5 text-ink-soft" />
      </div>
      <p className="text-heading-sm">{title}</p>
      <p className="text-body-sm text-ink-soft">{body}</p>
      {action && (
        <Button variant="outline" size="sm" className="mt-1">
          {action}
        </Button>
      )}
    </div>
  )
}
