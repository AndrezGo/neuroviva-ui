'use client';

import { useState, useCallback, useId } from 'react';
import { cn } from '@/shared/lib/cn';
import { useDiseases } from '@/application/curator/useDiseases';
import { useCreateGroup } from '@/application/curator/useCreateGroup';
import { Button } from '@/presentation/ui/Button';
import { TextField } from '@/presentation/ui/TextField';
import { Textarea } from '@/presentation/ui/Textarea';
import { DiseaseSelect } from '@/presentation/curator/DiseaseSelect';
import { AdminTabBar } from './AdminTabBar';
import type { GroupVisibility } from '@/domain/community/community.types';

// ─── Slug helpers ─────────────────────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9-]{3,60}$/;

/** Derives a slug suggestion from a display name. */
function toSlugSuggestion(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Admin community management screen.
 * Provides a "Crear grupo" form using useCreateGroup and useDiseases.
 * Slug is auto-suggested from the group name but fully editable.
 * Slug format is validated client-side before submit.
 */
export function AdminCommunityScreen() {
  const { diseases, isLoading: isLoadingDiseases } = useDiseases();
  const { create, isCreating, createError } = useCreateGroup();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [visibility, setVisibility] = useState<GroupVisibility>('public');
  const [diseaseId, setDiseaseId] = useState('');

  const visibilitySelectId = useId();
  const diseaseSelectId = useId();

  const resetForm = useCallback(() => {
    setName('');
    setSlug('');
    setSlugTouched(false);
    setDescription('');
    setAvatarUrl('');
    setVisibility('public');
    setDiseaseId('');
  }, []);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setName(newName);
      // Auto-suggest slug only while the user hasn't manually edited it
      if (!slugTouched) {
        setSlug(toSlugSuggestion(newName));
      }
    },
    [slugTouched],
  );

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    setSlug(e.target.value);
  }, []);

  const slugError =
    slug.length > 0 && !isValidSlug(slug)
      ? 'El slug solo puede contener minúsculas, números o guiones, y tener entre 3 y 60 caracteres.'
      : undefined;

  const isSubmitDisabled = !name.trim() || !slug.trim() || !isValidSlug(slug);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitDisabled) return;

      const success = await create({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        visibility,
        diseaseId: diseaseId || null,
      });

      if (success) {
        resetForm();
      }
    },
    [name, slug, description, avatarUrl, visibility, diseaseId, create, resetForm, isSubmitDisabled],
  );

  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-primary">
          Administración
        </p>
        <h1 className="text-2xl font-bold text-brand-dark">Comunidad</h1>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 px-5 pb-4">

        {/* ── Create group form ──────────────────────────────── */}
        <section aria-labelledby="crear-grupo-heading">
          <h2
            id="crear-grupo-heading"
            className="mb-3 text-base font-bold text-brand-dark"
          >
            Crear grupo
          </h2>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm"
          >
            {/* Name */}
            <TextField
              label="Nombre"
              placeholder="Nombre del grupo"
              value={name}
              onChange={handleNameChange}
              required
              maxLength={120}
              autoComplete="off"
            />

            {/* Slug */}
            <TextField
              label="Slug"
              placeholder="mi-grupo-de-apoyo"
              value={slug}
              onChange={handleSlugChange}
              required
              autoComplete="off"
              error={slugError}
              helperText={slugError ? undefined : '3–60 caracteres: minúsculas, números o guiones'}
            />

            {/* Description */}
            <Textarea
              label="Descripción (opcional)"
              placeholder="Breve descripción del grupo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            {/* Avatar URL */}
            <TextField
              label="URL del avatar (opcional)"
              type="url"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              autoComplete="off"
            />

            {/* Visibility */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={visibilitySelectId}
                className="text-sm font-semibold tracking-tight text-brand-dark"
              >
                Visibilidad
              </label>
              <select
                id={visibilitySelectId}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as GroupVisibility)}
                className={cn(
                  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5',
                  'text-base text-brand-dark',
                  'transition-all duration-200',
                  'hover:border-brand-primary/50',
                  'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
                )}
              >
                <option value="public">Pública</option>
                <option value="private">Privada</option>
              </select>
            </div>

            {/* Disease selector */}
            <DiseaseSelect
              id={diseaseSelectId}
              label="Condición (opcional)"
              diseases={diseases}
              value={diseaseId}
              onChange={setDiseaseId}
              isLoading={isLoadingDiseases}
            />

            {/* API / create error */}
            {createError && (
              <p role="alert" className="text-xs font-medium text-red-500">
                {createError}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isCreating}
              disabled={isSubmitDisabled}
            >
              Crear grupo
            </Button>
          </form>
        </section>
      </div>

      {/* ── Mobile tab bar ──────────────────────────────────────── */}
      <AdminTabBar activeTab="community" />
    </div>
  );
}
