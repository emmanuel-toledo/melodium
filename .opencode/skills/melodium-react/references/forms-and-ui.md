# Forms and UI

## Forms

Use `react-hook-form` with a Zod schema from the feature's `lib/`.

```ts
// src/features/compositions/lib/composition-schema.ts
import { z } from 'zod';

export const compositionSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio'),
  artist: z.string().trim().optional(),
  key: z.string().trim().optional(),
  capo: z.number().int().min(0).max(12).optional(),
  content: z.string().min(1, 'La letra es obligatoria'),
  tags: z.array(z.string()).default([]),
});

export type CompositionInput = z.infer<typeof compositionSchema>;
```

```tsx
const form = useForm<CompositionInput>({
  resolver: zodResolver(compositionSchema),
  defaultValues: {
    title: '',
    content: '',
    tags: [],
  },
});
```

Rules:

- The schema is the source of truth for validation and types. Do not duplicate the shape in a separate interface.
- Use `z.infer` for the form type.
- Show errors inline in Spanish, next to the field.
- Disable submit while the mutation is pending.
- Prevent duplicate submissions.
- Use sonner for transient success/error feedback; keep field errors inline.
- Do not use `useState` to mirror every field value. React Hook Form owns form state.
- Validate at the boundary before calling the feature `api/`.
- On edit, render the form only after the composition is loaded and pass the loaded values as `defaultValues`; use `key={composition.id}` so a different composition remounts the form. If you must call `reset`, call it from an event handler, not an effect.

## Accessibility

- Use semantic HTML: `form`, `label`, `button`, `fieldset`, `legend`, `nav`, `main`, `section`.
- Every input has a label. Placeholder text is not a label.
- Keep focus visible.
- Support keyboard navigation for all interactive controls.
- Do not remove outlines without a visible replacement.
- Use `aria-invalid` and `aria-describedby` for field errors.
- Announce transient errors with an appropriate live region when needed.
- Ensure contrast is sufficient; do not rely on color alone.
- Buttons have an explicit `type` (`button` or `submit`).
- Dialogs and menus manage focus and can be closed with Escape.

## UI states

Every data-driven screen covers:

- **Loading:** skeleton or clear loading message; do not show an empty state while loading.
- **Empty:** explain what is empty and offer the primary action.
- **Error:** explain what failed, in Spanish, and offer retry when possible.
- **Ready:** the normal content.

Do not render a blank screen while a subscription is starting.

## Mobile-first

- Design for a narrow viewport first, then enhance.
- Keep tap targets large enough.
- Avoid horizontal scrolling for chord sheets; use responsive wrapping.
- Test the chord sheet at small and large widths.
- Use the shared layout primitives instead of duplicating page chrome.

## ChordPro rendering

- The stored `content` is the original ChordPro source.
- Parse it in `src/features/compositions/lib`.
- Render the parsed model as React elements.
- Never use `dangerouslySetInnerHTML`.
- Show chords above lyrics in a readable layout; preserve line and section structure.
- Transpose only for display; never overwrite `content`.
- Show the original key and the current view key when they differ.
- Provide a clear way to return to the original key.

## Lists and cards

- Use stable IDs for keys.
- Use semantic lists when the content is a list.
- Make the whole card clickable only when the interaction is unambiguous; otherwise use a clear link or button.
- Keep the visible title and the accessible name aligned.

## Toasts and errors

- Use sonner for short-lived success or failure feedback.
- Keep validation errors inline; do not replace them with toasts.
- Map Firebase errors to Spanish messages.
- Do not expose raw error codes or stack traces.
- Do not use `console.log` in committed code.

## Tests

- Tests live under `tests/features/<feature>/`, mirroring `src/`; never next to the source.
- Test the form with React Testing Library: labels, errors, submit and pending state.
- Test empty, loading and error states.
- Test keyboard interaction for dialogs, menus and the chord sheet controls.
- Mock the feature `api/` or `@/shared/lib/firebase`; never use the network.
- Test the Spanish messages users see, not implementation details.
