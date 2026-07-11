'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/shared/lib/cn';
import { useCuratorResources } from '@/application/doctor/useCuratorResources';
import { useDiseases } from '@/application/curator/useDiseases';
import { useChannels } from '@/application/curator/useChannels';
import { useManageResources } from '@/application/curator/useManageResources';
import { Button } from '@/presentation/ui/Button';
import { TextField } from '@/presentation/ui/TextField';
import { Textarea } from '@/presentation/ui/Textarea';
import { Sheet } from '@/presentation/ui/Sheet';
import { DiseaseSelect } from './DiseaseSelect';
import { ChannelSelect } from './ChannelSelect';
import type { ResourceRequestType, Channel, AllResourceItem } from '@/domain/content/content.types';

// ─── Type label helper ────────────────────────────────────────────────────────

/**
 * Maps the resource type field to a Spanish display label.
 * Handles BOTH the PascalCase values received from the backend
 * ("News" | "ScientificArticle" | "Video") and the snake_case values
 * sent to the backend ("news" | "scientific_article" | "video").
 * Falls back to the raw value for unknown inputs.
 */
function mapTypeLabel(type: string): string {
  const normalized = type.toLowerCase().replace(/_/g, '');
  switch (normalized) {
    case 'news':
      return 'Noticia';
    case 'scientificarticle':
      return 'Artículo científico';
    case 'video':
      return 'Video';
    default:
      return type;
  }
}

// ─── Type request mapper ──────────────────────────────────────────────────────

/**
 * Maps a PascalCase or snake_case type string back to the snake_case ResourceRequestType
 * required by the PATCH endpoint. Mirrors mapTypeLabel's normalization strategy.
 */
function toRequestType(type: string): ResourceRequestType {
  const normalized = type.toLowerCase().replace(/_/g, '');
  if (normalized === 'scientificarticle') return 'scientific_article';
  if (normalized === 'video') return 'video';
  return 'news';
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  aprobado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
};

// ─── Date helper ──────────────────────────────────────────────────────────────

const MONTHS_SHORT = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CuratorResourcesPanelProps {
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Shared feature container holding the "Crear canal" form, the "Crear recurso"
 * form, the "Pendientes de revisión" list, and the "Todos los recursos" list.
 * Used by both DoctorCuratoriaScreen and AdminContentScreen — renders no TabBar
 * and no role-specific page header.
 *
 * Calls useCuratorResources(), useDiseases(), useChannels(), and
 * useManageResources() internally.
 */
export function CuratorResourcesPanel({ className }: CuratorResourcesPanelProps) {
  const {
    pending,
    isLoading,
    isError,
    error,
    reload,
    approve,
    approvingId,
    reject,
    rejectingId,
    create,
    isCreating,
    createError,
  } = useCuratorResources();

  const { diseases, isLoading: isLoadingDiseases } = useDiseases();

  const {
    channels,
    isLoading: isLoadingChannels,
    create: createChannel,
    isCreating: isCreatingChannel,
    createError: createChannelError,
    update: updateChannel,
    isUpdating: isUpdatingChannel,
    updateError: updateChannelError,
  } = useChannels();

  const {
    resources: allResources,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: errorAll,
    reload: reloadAll,
    update: updateResource,
    isUpdating: isUpdatingResource,
    updateError: updateResourceError,
  } = useManageResources();

  // ── "Crear canal" form state ───────────────────────────────────────────────
  const [isChannelFormOpen, setIsChannelFormOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');

  const handleCreateChannel = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!channelName.trim()) return;

      const success = await createChannel({
        name: channelName.trim(),
        description: channelDescription.trim() || null,
      });

      if (success) {
        setChannelName('');
        setChannelDescription('');
      }
    },
    [channelName, channelDescription, createChannel],
  );

  // ── Channel edit Sheet state ───────────────────────────────────────────────
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [editChannelName, setEditChannelName] = useState('');
  const [editChannelDescription, setEditChannelDescription] = useState('');

  const handleEditChannel = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingChannel || !editChannelName.trim()) return;

      const success = await updateChannel(editingChannel.id, {
        name: editChannelName.trim(),
        description: editChannelDescription.trim() || null,
      });

      if (success) {
        setEditingChannel(null);
      }
    },
    [editingChannel, editChannelName, editChannelDescription, updateChannel],
  );

  // ── "Crear recurso" form state ─────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceRequestType>('news');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [diseaseId, setDiseaseId] = useState('');
  const [channelId, setChannelId] = useState('');

  const resetForm = useCallback(() => {
    setTitle('');
    setType('news');
    setUrl('');
    setDescription('');
    setDiseaseId('');
    setChannelId('');
  }, []);

  const handleCreate = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!title.trim()) return;

      const success = await create({
        title: title.trim(),
        type,
        url: url.trim() || null,
        description: description.trim() || null,
        diseaseId: diseaseId || null,
        channelId: type === 'video' ? (channelId || null) : null,
      });

      if (success) {
        resetForm();
      }
    },
    [title, type, url, description, diseaseId, channelId, create, resetForm],
  );

  // ── Resource edit Sheet state ──────────────────────────────────────────────
  const [editingResource, setEditingResource] = useState<AllResourceItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<ResourceRequestType>('news');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDiseaseId, setEditDiseaseId] = useState('');
  const [editChannelId, setEditChannelId] = useState('');

  const handleEditResource = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingResource || !editTitle.trim()) return;

      const success = await updateResource(editingResource.id, {
        title: editTitle.trim(),
        type: editType,
        url: editUrl.trim() || null,
        description: editDescription.trim() || null,
        diseaseId: editDiseaseId || null,
        channelId: editType === 'video' ? (editChannelId || null) : null,
      });

      if (success) {
        setEditingResource(null);
      }
    },
    [editingResource, editTitle, editType, editUrl, editDescription, editDiseaseId, editChannelId, updateResource],
  );

  return (
    <div className={cn('flex flex-col gap-6 px-5 pb-4', className)}>

      {/* ── Section: Create channel form ─────────────────────── */}
      <section aria-labelledby="crear-canal-heading">
        <h2
          id="crear-canal-heading"
          className="mb-3 text-base font-bold text-brand-dark"
        >
          Crear canal
        </h2>

        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm">
          <button
            type="button"
            aria-expanded={isChannelFormOpen}
            aria-controls="crear-canal-form"
            onClick={() => setIsChannelFormOpen((prev) => !prev)}
            className={cn(
              'flex w-full items-center justify-between text-sm font-semibold text-brand-dark',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
            )}
          >
            <span>{isChannelFormOpen ? 'Ocultar formulario' : 'Nuevo canal'}</span>
            <span aria-hidden="true" className="text-gray-400">
              {isChannelFormOpen ? '▲' : '▼'}
            </span>
          </button>

          {isChannelFormOpen && (
            <form
              id="crear-canal-form"
              onSubmit={handleCreateChannel}
              noValidate
              className="mt-4 flex flex-col gap-4"
            >
              {/* Channel name */}
              <TextField
                label="Nombre del canal"
                placeholder="Nombre del canal"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                required
                autoComplete="off"
              />

              {/* Channel description */}
              <Textarea
                label="Descripción (opcional)"
                placeholder="Breve descripción del canal"
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
                rows={3}
              />

              {/* Create channel error */}
              {createChannelError && (
                <p role="alert" className="text-xs font-medium text-red-500">
                  {createChannelError}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isCreatingChannel}
                disabled={!channelName.trim()}
              >
                Crear canal
              </Button>
            </form>
          )}

          {/* Existing channels list */}
          {channels.length > 0 && (
            <ul className="mt-4 divide-y divide-gray-100 border-t border-gray-100 pt-2">
              {channels.map((ch) => (
                <li key={ch.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-medium text-brand-dark">{ch.name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    aria-label={`Editar canal: ${ch.name}`}
                    onClick={() => {
                      setEditingChannel(ch);
                      setEditChannelName(ch.name);
                      setEditChannelDescription(ch.description ?? '');
                    }}
                  >
                    Editar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Section A: Create resource form ─────────────────────── */}
      <section aria-labelledby="crear-recurso-heading">
        <h2
          id="crear-recurso-heading"
          className="mb-3 text-base font-bold text-brand-dark"
        >
          Crear recurso
        </h2>

        <form
          onSubmit={handleCreate}
          noValidate
          className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm"
        >
          {/* Title */}
          <TextField
            label="Título"
            placeholder="Nombre del recurso"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoComplete="off"
          />

          {/* Type selector */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="resource-type"
              className="text-sm font-semibold tracking-tight text-brand-dark"
            >
              Tipo
            </label>
            <select
              id="resource-type"
              value={type}
              onChange={(e) => setType(e.target.value as ResourceRequestType)}
              className={cn(
                'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5',
                'text-base text-brand-dark',
                'transition-all duration-200',
                'hover:border-brand-primary/50',
                'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
              )}
            >
              <option value="news">Noticia</option>
              <option value="scientific_article">Artículo científico</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* Disease selector */}
          <DiseaseSelect
            id="resource-disease"
            label="Condición (opcional)"
            diseases={diseases}
            value={diseaseId}
            onChange={setDiseaseId}
            isLoading={isLoadingDiseases}
          />

          {/* URL */}
          <TextField
            label="URL (opcional)"
            type="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoComplete="off"
          />

          {/* Channel selector — only for video type */}
          {type === 'video' && (
            <ChannelSelect
              id="resource-channel"
              label="Canal (opcional)"
              channels={channels}
              value={channelId}
              onChange={setChannelId}
              isLoading={isLoadingChannels}
            />
          )}

          {/* Description */}
          <Textarea
            label="Descripción (opcional)"
            placeholder="Breve descripción del contenido"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          {/* Create error */}
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
            disabled={!title.trim()}
          >
            Crear recurso
          </Button>
        </form>
      </section>

      {/* ── Section B: Pending resources list ───────────────── */}
      <section aria-labelledby="pendientes-heading">
        <h2
          id="pendientes-heading"
          className="mb-3 text-base font-bold text-brand-dark"
        >
          Pendientes de revisión
        </h2>

        {/* Loading skeleton */}
        {isLoading && (
          <div
            aria-busy="true"
            aria-label="Cargando recursos pendientes"
            className="space-y-3"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 w-full animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && isError && (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center"
          >
            <p className="text-sm font-medium text-red-700">
              {error ?? 'Error al cargar los recursos pendientes.'}
            </p>
            <Button variant="primary" size="sm" onClick={reload}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && pending.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-gray-text">
              No hay recursos pendientes de revisión.
            </p>
          </div>
        )}

        {/* Populated list */}
        {!isLoading && !isError && pending.length > 0 && (
          <ul className="space-y-3">
            {pending.map((item) => {
              const isThisApproving = approvingId === item.id;
              const isThisRejecting = rejectingId === item.id;
              const isThisBusy = isThisApproving || isThisRejecting;

              return (
                <li key={item.id}>
                  <article className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
                    {/* Title + type badge */}
                    <div className="flex flex-wrap items-start gap-2">
                      <h3 className="flex-1 text-sm font-bold leading-snug text-brand-dark">
                        {item.title}
                      </h3>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          'bg-brand-primary-light text-brand-primary',
                        )}
                      >
                        {mapTypeLabel(item.type)}
                      </span>
                    </div>

                    {/* Optional description */}
                    {item.description && (
                      <p className="text-xs leading-relaxed text-gray-text line-clamp-3">
                        {item.description}
                      </p>
                    )}

                    {/* Optional URL */}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'inline-flex items-center self-start rounded-xl',
                          'bg-brand-primary-light px-3 py-1.5 text-xs font-semibold text-brand-primary',
                          'transition-colors hover:bg-brand-primary hover:text-white',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
                        )}
                        aria-label={`Ver recurso: ${item.title} (se abre en una nueva pestaña)`}
                      >
                        Ver recurso
                      </a>
                    )}

                    {/* Date */}
                    <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        isLoading={isThisApproving}
                        disabled={isThisBusy}
                        onClick={() => approve(item.id)}
                        className={cn(
                          'bg-green-600 text-white shadow-sm',
                          'hover:bg-green-700',
                          'focus-visible:ring-green-600',
                        )}
                        aria-label={`Aprobar: ${item.title}`}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        isLoading={isThisRejecting}
                        disabled={isThisBusy}
                        onClick={() => reject(item.id)}
                        className={cn(
                          'border-red-300 text-red-600',
                          'hover:border-red-500 hover:text-red-700',
                        )}
                        aria-label={`Rechazar: ${item.title}`}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Section C: All resources list ───────────────────── */}
      <section aria-labelledby="todos-recursos-heading">
        <h2
          id="todos-recursos-heading"
          className="mb-3 text-base font-bold text-brand-dark"
        >
          Todos los recursos
        </h2>

        {/* Loading skeleton */}
        {isLoadingAll && (
          <div
            aria-busy="true"
            aria-label="Cargando todos los recursos"
            className="space-y-3"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 w-full animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoadingAll && isErrorAll && (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center"
          >
            <p className="text-sm font-medium text-red-700">
              {errorAll ?? 'Error al cargar los recursos.'}
            </p>
            <Button variant="primary" size="sm" onClick={reloadAll}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoadingAll && !isErrorAll && allResources.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-gray-text">
              No hay recursos registrados.
            </p>
          </div>
        )}

        {/* Populated list */}
        {!isLoadingAll && !isErrorAll && allResources.length > 0 && (
          <ul className="space-y-3">
            {allResources.map((item) => (
              <li key={item.id}>
                <article className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
                  {/* Title + type badge + status badge */}
                  <div className="flex flex-wrap items-start gap-2">
                    <h3 className="flex-1 text-sm font-bold leading-snug text-brand-dark">
                      {item.title}
                    </h3>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        'bg-brand-primary-light text-brand-primary',
                      )}
                    >
                      {mapTypeLabel(item.type)}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        STATUS_BADGE_CLASS[item.approvalStatus] ?? 'bg-amber-100 text-amber-700',
                      )}
                    >
                      {STATUS_LABEL[item.approvalStatus] ?? item.approvalStatus}
                    </span>
                  </div>

                  {/* Channel name if present */}
                  {item.channelName && (
                    <p className="text-xs text-gray-400">
                      Canal: {item.channelName}
                    </p>
                  )}

                  {/* Optional description */}
                  {item.description && (
                    <p className="text-xs leading-relaxed text-gray-text line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  {/* Date */}
                  <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>

                  {/* Edit button */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      aria-label={`Editar recurso: ${item.title}`}
                      onClick={() => {
                        setEditingResource(item);
                        setEditTitle(item.title);
                        setEditType(toRequestType(item.type));
                        setEditUrl(item.url ?? '');
                        setEditDescription(item.description ?? '');
                        setEditDiseaseId(item.diseaseId ?? '');
                        setEditChannelId(item.channelId ?? '');
                      }}
                    >
                      Editar
                    </Button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Channel edit Sheet ───────────────────────────────── */}
      <Sheet
        open={editingChannel !== null}
        onClose={() => setEditingChannel(null)}
        title="Editar canal"
      >
        <form onSubmit={handleEditChannel} noValidate className="flex flex-col gap-4">
          <TextField
            label="Nombre del canal"
            placeholder="Nombre del canal"
            value={editChannelName}
            onChange={(e) => setEditChannelName(e.target.value)}
            required
            autoComplete="off"
          />

          <Textarea
            label="Descripción (opcional)"
            placeholder="Breve descripción del canal"
            value={editChannelDescription}
            onChange={(e) => setEditChannelDescription(e.target.value)}
            rows={3}
          />

          {updateChannelError && (
            <p role="alert" className="text-xs font-medium text-red-500">
              {updateChannelError}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isUpdatingChannel}
            disabled={!editChannelName.trim()}
          >
            Guardar cambios
          </Button>
        </form>
      </Sheet>

      {/* ── Resource edit Sheet ──────────────────────────────── */}
      <Sheet
        open={editingResource !== null}
        onClose={() => setEditingResource(null)}
        title="Editar recurso"
      >
        <form onSubmit={handleEditResource} noValidate className="flex flex-col gap-4">
          {/* Title */}
          <TextField
            label="Título"
            placeholder="Nombre del recurso"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            autoComplete="off"
          />

          {/* Type selector */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-resource-type"
              className="text-sm font-semibold tracking-tight text-brand-dark"
            >
              Tipo
            </label>
            <select
              id="edit-resource-type"
              value={editType}
              onChange={(e) => setEditType(e.target.value as ResourceRequestType)}
              className={cn(
                'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5',
                'text-base text-brand-dark',
                'transition-all duration-200',
                'hover:border-brand-primary/50',
                'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
              )}
            >
              <option value="news">Noticia</option>
              <option value="scientific_article">Artículo científico</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* Disease selector */}
          <DiseaseSelect
            id="edit-resource-disease"
            label="Condición (opcional)"
            diseases={diseases}
            value={editDiseaseId}
            onChange={setEditDiseaseId}
            isLoading={isLoadingDiseases}
          />

          {/* URL */}
          <TextField
            label="URL (opcional)"
            type="url"
            placeholder="https://..."
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            autoComplete="off"
          />

          {/* Channel selector — only for video type */}
          {editType === 'video' && (
            <ChannelSelect
              id="edit-resource-channel"
              label="Canal (opcional)"
              channels={channels}
              value={editChannelId}
              onChange={setEditChannelId}
              isLoading={isLoadingChannels}
            />
          )}

          {/* Description */}
          <Textarea
            label="Descripción (opcional)"
            placeholder="Breve descripción del contenido"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
          />

          {updateResourceError && (
            <p role="alert" className="text-xs font-medium text-red-500">
              {updateResourceError}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isUpdatingResource}
            disabled={!editTitle.trim()}
          >
            Guardar cambios
          </Button>
        </form>
      </Sheet>
    </div>
  );
}
