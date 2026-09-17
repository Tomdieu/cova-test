import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Separator } from "@/components/ui/separator";

export function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Cova Task</h1>
          <p className="text-muted-foreground mt-2">Manage your tasks with ease</p>
        </div>
        <Card className="shadow-lg border-muted/50">
          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="register">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to continue</CardDescription>
                </CardHeader>
                <Separator className="mb-4" />
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">Create an account</CardTitle>
                  <CardDescription>Fill in the details to get started</CardDescription>
                </CardHeader>
                <Separator className="mb-4" />
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
