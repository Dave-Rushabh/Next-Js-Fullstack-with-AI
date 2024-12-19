"use client";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Cog, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiResponse } from "@/types/ApiResponse";

const MessagePage = () => {
  const params = useParams();
  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const username = params?.username;
  const { toast } = useToast();

  const messageSubmitSchema = z.object({
    message: z
      .string()
      .min(10, { message: "Message must be at least 10 characters long" })
      .max(200, { message: "Message cannot exceed 200 characters" })
      .nonempty({ message: "Message cannot be empty" }),
  });

  const form = useForm({
    resolver: zodResolver(messageSubmitSchema),
    defaultValues: { message: "" },
  });

  const getAiMessages = async () => {
    setIsGeneratingMessages(true);
    try {
      const response = await axios.get("/api/generate-message");
      if (response) {
        const receivedMessages = response.data?.data;

        if (receivedMessages?.length) {
          const formattedMessages = receivedMessages?.split("| |");

          setAiMessages(formattedMessages);
          toast({
            title: "Success",
            description: "AI messages Generated successfully",
            className: "bg-green-200",
          });
        } else {
          setAiMessages([]);
          toast({
            title: "Failed",
            description: "Error while generating the AI messages",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error(error, "Error while generating the AI messages");
      toast({
        title: "Failed",
        description: "Error while generating the AI messages",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMessages(false);
    }
  };

  const onSubmit = async (data: FieldValues) => {
    const message = data.message;

    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/send-message", {
        username,
        content: message,
      });

      if (response) {
        toast({
          title: "Success",
          description: response.data.message,
          className: "bg-green-200",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error(error, "Error while sending the message");
      toast({
        title: "Failed",
        description: axiosError.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      form.setValue("message", "");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white p-12">
        <div className="container flex flex-col">
          <h1 className="text-3xl font-bold text-center">Stealth Message</h1>
          <p className="mt-12">
            Send your stealth message to :
            <b className="ml-2">
              <u>{username}</u>
            </b>
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="message"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Message"
                        {...field}
                        className="mt-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                    wait
                  </>
                ) : (
                  "Send message"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-16">
            <h3>
              Need a message ? Generate <b>AI powered</b> message from Gemini
              AI.
            </h3>
            <Button
              className="mt-4"
              variant="outline"
              type="submit"
              disabled={isGeneratingMessages}
              onClick={getAiMessages}
            >
              {isGeneratingMessages ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
                </>
              ) : (
                <>
                  <Cog />
                  {"Generate"}
                </>
              )}
            </Button>

            {isGeneratingMessages ? (
              <>
                {Array.from({ length: 10 }, (_, idx) => (
                  <React.Fragment key={idx}>
                    <Skeleton className="h-12 w-full my-2" />
                  </React.Fragment>
                ))}
              </>
            ) : (
              <>
                {aiMessages.length ? (
                  <div className="shadow-md p-4 myt-4">
                    {aiMessages.map((message, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          form.setValue("message", message);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-full my-2 text-sm border-2 border-slate-200 p-2 rounded-lg hover:bg-slate-400 hover:text-white hover:cursor-pointer"
                      >
                        {message}
                      </div>
                    ))}
                  </div>
                ) : (
                  <></>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessagePage;
