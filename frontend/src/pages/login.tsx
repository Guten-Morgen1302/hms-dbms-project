import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, setAuthToken, queryClient as qc } from "@/lib/queryClient";
import { Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import loginIllustration from "@assets/generated_images/Login_page_medical_illustration_11f0058f.png";

type LoginFormData = {
  username: string;
  password: string;
  name?: string;
  email?: string;
};

const createLoginSchema = (isRegister: boolean) => z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  name: isRegister ? z.string().min(1, "Name is required") : z.string().optional(),
  email: isRegister ? z.string().email("Valid email is required") : z.string().optional(),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const queryClient = qc;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(isRegister)),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
    },
  });

  // Reset form validation when switching between login/register
  const handleToggle = () => {
    setIsRegister(!isRegister);
    form.clearErrors();
  };

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      // Force patient role for registrations
      const payload = isRegister ? { ...data, role: "patient" } : data;
      const response = await apiRequest("POST", endpoint, payload);
      return response;
    },
    onSuccess: (data) => {
      if (data.token) {
        setAuthToken(data.token);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: isRegister ? "Account created successfully" : "Welcome back!",
      });
      // Redirect based on role - patients go to patient dashboard
      if (data.user?.role === "patient") {
        setLocation("/patient/dashboard");
      } else {
        setLocation("/");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen">
      <motion.div 
        className="flex-1 flex items-center justify-center p-8 bg-background"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary">
              <Stethoscope className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-app-name">HMS</h1>
              <p className="text-sm text-muted-foreground">Hospital Management System</p>
            </div>
          </div>

          <Card className="p-8 rounded-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" data-testid="text-login-title">
                {isRegister ? "Create Patient Account" : "Welcome Back"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isRegister ? "Register as a patient to access your health portal" : "Sign in to your account"}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isRegister && (
                  <>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your full name" 
                              className="h-11 rounded-lg"
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email" 
                              placeholder="Enter your email" 
                              className="h-11 rounded-lg"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your username" 
                          className="h-11 rounded-lg"
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="Enter your password" 
                          className="h-11 rounded-lg"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-lg font-semibold"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit"
                >
                  {loginMutation.isPending ? "Please wait..." : (isRegister ? "Create Account" : "Sign In")}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-primary hover:underline"
                data-testid="button-toggle-mode"
              >
                {isRegister ? "Already have an account? Sign in" : "Don't have an account? Register"}
              </button>
            </div>
          </Card>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            Secure healthcare management platform
          </p>
        </div>
      </motion.div>

      <motion.div 
        className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="relative w-full max-w-lg">
          <img 
            src={loginIllustration} 
            alt="Medical illustration" 
            className="w-full h-auto"
          />
        </div>
      </motion.div>
    </div>
  );
}
