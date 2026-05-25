"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type FaqItem = {
  category: string;
  question: string;
  answer: string;
};

export function FaqAccordion({
  items,
  categories,
}: {
  items: FaqItem[];
  categories: string[];
}) {
  return (
    <div className="flex flex-col gap-8">
      {categories.map((category) => {
        const categoryFaqs = items.filter((faq) => faq.category === category);
        if (categoryFaqs.length === 0) return null;

        return (
          <Card
            key={category}
            id={category.toLowerCase().replace(/\s+/g, "-")}
            className="border-slate-200/80 dark:border-slate-800"
          >
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <Accordion type="single" collapsible className="w-full">
                {categoryFaqs.map((item) => (
                  <AccordionItem key={item.question} value={item.question}>
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
