import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Battle Semantic
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            AI-Optimized Next.js Stack with shadcn/ui
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            🔄 Auto-restart enabled with nodemon
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Next.js 14</CardTitle>
              <CardDescription>
                App Router with TypeScript
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Modern React framework with server-side rendering and API routes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tailwind CSS</CardTitle>
              <CardDescription>
                Utility-first styling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Rapid UI development with responsive design utilities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>shadcn/ui</CardTitle>
              <CardDescription>
                Beautiful shadcn/ui components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Copy-paste components built with Radix UI and Tailwind.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Test Components</CardTitle>
              <CardDescription>
                Try the shadcn/ui components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Type something..." />
              <div className="flex gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
