"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";

const hexInputSchema = z.object({
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Enter a valid 6-digit hex code (e.g., #RRGGBB).",
  }),
});

type HexInputFormValues = z.infer<typeof hexInputSchema>;

interface HexInputProps {
  onAddColor: (hex: string) => void;
}

export function HexInput({ onAddColor }: HexInputProps) {
  const form = useForm<HexInputFormValues>({
    resolver: zodResolver(hexInputSchema),
    defaultValues: {
      hexCode: "",
    },
  });

  const onSubmit: SubmitHandler<HexInputFormValues> = (data) => {
    onAddColor(data.hexCode.toUpperCase());
    form.reset();
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">Add New Color</CardTitle>
        <CardDescription>Enter a hex code to add it to your palette.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="hexCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="hexCode" className="text-base">Hex Code</FormLabel>
                  <FormControl>
                    <Input id="hexCode" placeholder="#AA00BB" {...field} className="text-lg font-mono tracking-wider"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-base py-3">
              <PlusIcon className="mr-2 h-5 w-5" />
              Add to Palette
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
