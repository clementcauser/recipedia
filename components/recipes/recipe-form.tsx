"use client";

import {
  createRecipe,
  updateRecipe,
  extractRecipeFromUrlAction,
} from "@/app/actions/recipe.actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  note: z.string().optional(),
});

const stepSchema = z.object({
  instruction: z.string().min(1, "L'instruction est requise"),
  imageUrl: z.string().optional(),
});

const recipeSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  prepTimeMinutes: z.number().optional(),
  cookTimeMinutes: z.number().optional(),
  servings: z.number().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  isPublic: z.boolean(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(stepSchema),
});

export type FormValues = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  initialData?: any; // We'll handle mapping in the component
}

export function RecipeForm({ initialData }: RecipeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const hasAutoImported = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialData
      ? {
          title: initialData.title || "",
          description: initialData.description || "",
          imageUrl: initialData.imageUrl || "",
          prepTimeMinutes: initialData.prepTimeMinutes || 0,
          cookTimeMinutes: initialData.cookTimeMinutes || 0,
          servings: initialData.servings || 1,
          difficulty: initialData.difficulty || "MEDIUM",
          isPublic: initialData.isPublic ?? true,
          ingredients: initialData.ingredients?.map((ri: any) => ({
            name: ri.ingredient.name,
            quantity: Number(ri.quantity) || 0,
            unit: ri.unit || "",
            note: ri.note || "",
          })) || [{ name: "", quantity: 0, unit: "", note: "" }],
          steps: initialData.steps?.map((s: any) => ({
            instruction: s.instruction,
            imageUrl: s.imageUrl || "",
          })) || [{ instruction: "", imageUrl: "" }],
        }
      : {
          title: "",
          description: "",
          imageUrl: "",
          prepTimeMinutes: 0,
          cookTimeMinutes: 0,
          servings: 1,
          difficulty: "MEDIUM",
          isPublic: true,
          ingredients: [{ name: "", quantity: 0, unit: "", note: "" }],
          steps: [{ instruction: "", imageUrl: "" }],
        },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      if (initialData?.id) {
        await updateRecipe(initialData.id, values);
        toast.success("Recette mise à jour !");
      } else {
        await createRecipe(values);
        toast.success("Recette créée !");
      }
      router.push("/recipes");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImport(urlToFetch?: string) {
    const url = urlToFetch || importUrl;
    if (!url) return;

    setIsImporting(true);
    try {
      const data = await extractRecipeFromUrlAction(url);

      const currentValues = form.getValues();
      form.reset({
        ...currentValues,
        title: data.title || currentValues.title,
        description: data.description || currentValues.description,
        imageUrl: data.imageUrl || currentValues.imageUrl,
        prepTimeMinutes: data.prepTimeMinutes || currentValues.prepTimeMinutes,
        cookTimeMinutes: data.cookTimeMinutes || currentValues.cookTimeMinutes,
        servings: data.servings || currentValues.servings,
        difficulty: data.difficulty || currentValues.difficulty,
        // Replace ingredients if we found some
        ingredients:
          data.ingredients && data.ingredients.length > 0
            ? data.ingredients.map((ing) => ({
                name: ing.name,
                quantity: ing.quantity ? Number(ing.quantity) : 0,
                unit: ing.unit || "",
                note: ing.note || "",
              }))
            : currentValues.ingredients,
        // Replace steps if we found some
        steps:
          data.steps && data.steps.length > 0
            ? data.steps.map((step) => ({
                instruction: step.instruction,
                imageUrl: "",
              }))
            : currentValues.steps,
      });

      toast.success("Recette importée avec succès. Vérifiez les données !");
      setImportUrl(""); // Clear the input
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'importation",
      );
    } finally {
      setIsImporting(false);
    }
  }

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !hasAutoImported.current &&
      !initialData
    ) {
      const params = new URLSearchParams(window.location.search);
      const urlToImport = params.get("importUrl");
      if (urlToImport) {
        hasAutoImported.current = true;
        setImportUrl(urlToImport);
        handleImport(urlToImport);

        // Remove the query param gracefully
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  return (
    <div className="space-y-8">
      {/* Import Section */}
      {!initialData && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-black text-slate-800 tracking-tight">
              Importer depuis une URL
            </label>
            <div className="flex gap-3">
              <Input
                placeholder="https://www.marmiton.org/..."
                className="h-12 bg-slate-50 border-none focus-visible:ring-primary/20 rounded-xl px-4 font-medium text-slate-600 flex-1"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                disabled={isImporting}
              />
              <Button
                type="button"
                onClick={() => handleImport()}
                disabled={isImporting || !importUrl}
                className="h-12 px-6 rounded-xl bg-primary text-white font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95 whitespace-nowrap"
              >
                {isImporting ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Importer
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Nous allons essayer de pré-remplir le formulaire automatiquement.
            </p>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Informations Générales
              </h2>
              <p className="text-slate-500 font-medium">
                Les détails essentiels de votre chef-d'œuvre.
              </p>
            </div>

            <div className="grid gap-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      Titre de la recette
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ex: Lasagnes à la bolognaise"
                        className="h-14 bg-slate-50 border-none focus-visible:ring-primary/20 rounded-2xl px-6 font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Racontez l'histoire de ce plat..."
                        className="min-h-[120px] bg-slate-50 border-none focus-visible:ring-primary/20 rounded-2xl p-6 font-medium text-slate-600 placeholder:text-slate-400 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      URL de l'image
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        className="h-14 bg-slate-50 border-none focus-visible:ring-primary/20 rounded-2xl px-6 font-medium text-slate-600"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      Difficulté
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 bg-slate-50 border-none focus:ring-primary/20 rounded-2xl px-6 font-bold text-slate-700">
                          <SelectValue placeholder="Choisir" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                        <SelectItem
                          value="EASY"
                          className="rounded-xl font-bold py-3"
                        >
                          Facile
                        </SelectItem>
                        <SelectItem
                          value="MEDIUM"
                          className="rounded-xl font-bold py-3"
                        >
                          Moyen
                        </SelectItem>
                        <SelectItem
                          value="HARD"
                          className="rounded-xl font-bold py-3"
                        >
                          Difficile
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "prepTimeMinutes", label: "Préparation", unit: "min" },
                { name: "cookTimeMinutes", label: "Cuisson", unit: "min" },
                { name: "servings", label: "Portions", unit: "pers." },
              ].map((stat) => (
                <FormField
                  key={stat.name}
                  control={form.control}
                  name={stat.name as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-tighter sm:tracking-widest">
                        {stat.label}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            className="h-14 bg-slate-50 border-none focus-visible:ring-primary/20 rounded-2xl px-6 font-bold text-slate-700 pr-12"
                            {...field}
                            onChange={(val) =>
                              field.onChange(parseInt(val.target.value) || 0)
                            }
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">
                            {stat.unit}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Visibilité
                    </FormLabel>
                    <div className="h-14 bg-slate-50 rounded-2xl px-6 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">
                        Publique
                      </span>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Ingrédients
                </h2>
                <p className="text-slate-500 font-medium">
                  Listez ce dont vous avez besoin.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4 font-bold border-slate-100 text-primary hover:bg-slate-50 transition-all active:scale-95"
                onClick={() =>
                  appendIngredient({
                    name: "",
                    quantity: 0,
                    unit: "",
                    note: "",
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-4">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="group flex gap-3 items-center">
                  <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-5">
                          <FormControl>
                            <Input
                              placeholder="Nom (Farine, Sucre...)"
                              className="h-12 bg-slate-50 border-none focus-visible:ring-primary/20 rounded-xl px-4 font-bold text-slate-700"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-6 md:col-span-3 flex gap-2">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Qté"
                                className="h-12 bg-slate-50 border-none focus-visible:ring-primary/20 rounded-xl px-4 font-bold text-slate-700"
                                {...field}
                                onChange={(val) =>
                                  field.onChange(
                                    parseFloat(val.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.unit`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Unité"
                                className="h-12 bg-slate-50 border-none focus-visible:ring-primary/20 rounded-xl px-4 font-bold text-slate-700"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.note`}
                      render={({ field }) => (
                        <FormItem className="col-span-6 md:col-span-4">
                          <FormControl>
                            <Input
                              placeholder="Note (facultatif)"
                              className="h-12 bg-slate-50 border-none focus-visible:ring-primary/20 rounded-xl px-4 font-medium text-slate-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredientFields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Instructions
                </h2>
                <p className="text-slate-500 font-medium">
                  Guidez les autres étape par étape.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4 font-bold border-slate-100 text-primary hover:bg-slate-50 transition-all active:scale-95"
                onClick={() => appendStep({ instruction: "", imageUrl: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-10">
              {stepFields.map((field, index) => (
                <div key={field.id} className="flex gap-6 group">
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold text-lg shadow-lg shadow-primary/30">
                      {index + 1}
                    </div>
                    <div className="flex-1 w-0.5 bg-slate-100 rounded-full my-2 group-last:hidden" />
                  </div>

                  <div className="flex-1 space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xl text-slate-800 tracking-tight">
                        Étape {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-slate-300 hover:text-destructive hover:bg-destructive/10 transition-all"
                        onClick={() => removeStep(index)}
                        disabled={stepFields.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`steps.${index}.instruction`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Que faut-il faire à cette étape ?"
                              className="min-h-[100px] bg-slate-50 border-none focus-visible:ring-primary/20 rounded-2xl p-6 font-medium text-slate-600 placeholder:text-slate-400 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`steps.${index}.imageUrl`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="URL d'une image illustrative (optionnel)"
                                className="h-12 bg-slate-50 border-none focus-visible:ring-primary/20 rounded-xl px-4 font-medium text-slate-500 text-sm"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <Button
              type="submit"
              className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading
                ? "Enregistrement..."
                : initialData
                  ? "Mettre à jour la recette"
                  : "Publier la recette"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-14 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
