import { Cross1Icon, Pencil1Icon, PlusIcon } from '@radix-ui/react-icons';
import Button from './button';
import { ReactNode, useRef } from 'react';
import { useLabel } from '@/contexts/label/label-context';
import { Controller, useForm } from 'react-hook-form';
import FormField from './form-field';
import Input from './input';
import { Subject } from '@/contexts/subjects/subjects-context';
import { cn, generateColor } from '@/utils';
import React from 'react';
import Tooltip from './tooltip';
import { usePlannerStore } from '@/stores/planner';

type SubjectDialogProps = {
  renderTrigger?: (dialogRef: React.RefObject<HTMLDialogElement>) => ReactNode;
  onClose?: () => void;
  onSubmit?: (subjectData: Subject) => void;
} & (
  | {
      mode: 'edit';
      subjectData: Subject;
    }
  | {
      mode: 'create';
      subjectData?: Partial<Subject> | undefined;
    }
) &
  Omit<JSX.IntrinsicElements['dialog'], 'onSubmit'>;

type FormData = Omit<Subject, 'courses'>;

export default function SubjectDialog({
  subjectData,
  mode,
  renderTrigger,
  onClose,
  onSubmit,
  className,
  ...props
}: SubjectDialogProps) {
  const { labels } = useLabel();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { savedSubjects } = usePlannerStore();

  function closeDialog() {
    dialogRef.current?.close();
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    control,
  } = useForm<FormData>({
    defaultValues: subjectData,
    mode: 'onTouched',
  });

  async function submitHandler(formData: FormData) {
    const subject: Subject = {
      ...formData,
      courses: [],
      origin: 'custom',
    };

    if (!subject.color) {
      subject.color = generateColor(subject.code + subject.name);
    }

    if (typeof onSubmit === 'function') {
      setTimeout(() => {
        onSubmit(subject);
      });
    }

    closeDialog();
  }

  return (
    <>
      {typeof renderTrigger === 'function' ? (
        renderTrigger(dialogRef)
      ) : (
        <Button
          className="btn-outline btn-info btn-sm"
          icon={<Pencil1Icon width={20} height={20} />}
          title={labels.EDIT}
          onClick={() => {
            dialogRef.current?.showModal();
          }}
        />
      )}
      <dialog
        ref={dialogRef}
        className={cn('modal pointer-events-none text-base-content', className)}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
              <Cross1Icon width={20} height={20} />
            </button>
          </form>
          <h3 className="text-lg font-bold">
            {mode === 'edit' && `${labels.EDIT_SUBJECT} (${subjectData.code})`}
            {mode === 'create' && `${labels.CREATE_SUBJECT}`}
          </h3>

          <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex flex-col gap-3"
          >
            {mode === 'create' && (
              <FormField
                required
                label={labels.CODE}
                errorMessage={errors.code?.message}
              >
                <Controller
                  name="code"
                  control={control}
                  rules={{
                    required: true,
                    validate: {
                      check: (value) => {
                        const codeExists = savedSubjects.find(
                          (s) => s.code === value,
                        );
                        if (codeExists) {
                          return labels.SUBJECT_WITH_THIS_CODE_ALREADY_EXISTS;
                        }
                      },
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="w-full"
                      placeholder={labels.CODE}
                      aria-invalid={!!errors.code}
                      value={subjectData?.code}
                    />
                  )}
                />

                {/* TODO: check code uniqueness */}
              </FormField>
            )}

            <FormField
              required
              label={labels.NAME}
              errorMessage={errors.name?.message}
            >
              <Input
                className="w-full"
                placeholder={labels.NAME}
                aria-invalid={!!errors.name}
                {...register('name', {
                  required: true,
                })}
                value={subjectData?.name}
              />
            </FormField>

            <FormField
              label={labels.COLOR}
              labelIcon={
                <Tooltip
                  className="tooltip-right"
                  text={labels.COLOR_GENERATION_TOOLTIP}
                />
              }
              errorMessage={errors.color?.message}
            >
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Input
                      {...field}
                      type="color"
                      placeholder={labels.COLOR}
                      aria-invalid={!!errors.color}
                      value={subjectData?.color}
                    />
                    {field.value && (
                      <button
                        title={labels.CLEAR}
                        type="button"
                        onClick={() => setValue('color', undefined)}
                      >
                        <Cross1Icon />
                      </button>
                    )}
                  </div>
                )}
              />
            </FormField>

            <div className="flex justify-end gap-3">
              <Button
                className="btn-ghost btn-outline btn-md"
                label={labels.CLOSE}
                onClick={() => {
                  closeDialog();
                }}
              />
              <Button
                className={cn('btn-primary btn-md', {
                  'btn-success': mode === 'create',
                })}
                label={mode === 'edit' ? labels.SAVE : labels.CREATE}
                disabled={!isDirty}
                icon={
                  mode === 'edit' ? (
                    <Pencil1Icon width={20} height={20} />
                  ) : (
                    <PlusIcon width={20} height={20} />
                  )
                }
                type="submit"
              />
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
