"use client";

import { createRecipe, updateRecipe } from "@/app/actions/recipe.actions";
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
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Informations Générales</h2>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de la recette</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: Lasagnes à la bolognaise"
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Une brève présentation..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l'image</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
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
                  <FormLabel>Difficulté</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une difficulté" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EASY">Facile</SelectItem>
                      <SelectItem value="MEDIUM">Moyen</SelectItem>
                      <SelectItem value="HARD">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="prepTimeMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prép. (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(val) =>
                        field.onChange(parseInt(val.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cookTimeMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuisson (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(val) =>
                        field.onChange(parseInt(val.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="servings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portions</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-8">
                  <div className="space-y-0.5">
                    <FormLabel>Publique</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ingrédients</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendIngredient({ name: "", quantity: 0, unit: "", note: "" })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-4">
            {ingredientFields.map((field, index) => (
              <div
                key={field.id}
                className="flex gap-4 items-start border p-4 rounded-lg bg-muted/30"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormControl>
                          <Input placeholder="Nom (Farine...)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Quantité"
                            {...field}
                            onChange={(val) =>
                              field.onChange(parseInt(val.target.value))
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
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Unité (g...)" {...field} />
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
                  className="text-destructive mt-1"
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Étapes de préparation</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendStep({ instruction: "", imageUrl: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-6">
            {stepFields.map((field, index) => (
              <div key={field.id} className="space-y-4 border p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Étape {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeStep(index)}
                    disabled={stepFields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`steps.${index}.instruction`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez l'étape..."
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
                        <Input
                          placeholder="URL de l'image pour cette étape (optionnel)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading
            ? "Chargement..."
            : initialData
              ? "Mettre à jour la recette"
              : "Enregistrer la recette"}
        </Button>
      </form>
    </Form>
  );
}
