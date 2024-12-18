"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDebounceCallback, useDebounceValue } from "usehooks-ts";
import * as z from "zod";

const SignUp = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [data, setData] = useState({
    username: "",
    usernameCheckResponse: "",
    isCheckingUsername: false,
    isFormSubmitting: false,
  });
  const modifyUsername = (value: string) =>
    setData((prev) => ({ ...prev, username: value }));
  const debounced = useDebounceCallback(modifyUsername, 700);

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (data.username) {
        setData((prev) => ({
          ...prev,
          isCheckingUsername: true,
          usernameCheckResponse: "",
        }));

        try {
          const resp = await axios.get(
            `/api/check-unique-username/?username=${data.username}`
          );
          const { message } = await resp.data;

          setData((prev) => ({
            ...prev,
            isCheckingUsername: false,
            usernameCheckResponse: message,
          }));
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setData((prev) => ({
            ...prev,
            isCheckingUsername: false,
            usernameCheckResponse:
              axiosError.response?.data.message ??
              "Error checking uniqueness of username",
          }));
        }
      }
    };
    checkUsernameAvailability();
  }, [data.username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setData((prev) => ({
      ...prev,
      isFormSubmitting: true,
    }));

    try {
      const resp = await axios.post<ApiResponse>("/api/sign-up", data);

      toast({
        title: "Success",
        description: resp.data.message,
      });

      setTimeout(() => {
        router.replace(`/verify/${data.username}`);
      }, 1500);
    } catch (error) {
      console.error("Error signin up the user", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Sign Up Failed",
        description: axiosError.response?.data.message,
      });
    } finally {
      setData((prev) => ({
        ...prev,
        isFormSubmitting: false,
      }));
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              Join
              <br />
              Stealth Message
            </h1>
            <p className="mb-4">Sign up to get started</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          debounced(e.target.value);
                        }}
                      />
                    </FormControl>
                    {data.isCheckingUsername && (
                      <Loader2 className="animate-spin" />
                    )}
                    <p
                      className={`text-sm ${
                        data.usernameCheckResponse === "Username is available"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {data.username.length > 0 && data.usernameCheckResponse}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={data.isFormSubmitting}>
                {data.isFormSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                    wait
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center mt-4">
            <p>
              Already a member ?
              <Link
                href={"/sign-in"}
                className="text-blue-600 hover:text-blue-800 ml-2"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
