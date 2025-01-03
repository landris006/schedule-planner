import { Cross1Icon, Pencil1Icon, PlusIcon } from '@radix-ui/react-icons';
import Button from './button';
import { ReactNode, useRef } from 'react';
import { useLabel } from '@/contexts/label/label-context';
import { useForm } from 'react-hook-form';
import FormField from './form-field';
import Input from './input';
import { Course, CourseType } from '@/contexts/subjects/subjects-context';
import { cn, floatToHHMM, hhmmToFloat } from '@/utils';
import Tooltip from './tooltip';
import React from 'react';
import { v4 as uuid } from 'uuid';

type CourseDialogProps = {
  renderTrigger?: (dialogRef: React.RefObject<HTMLDialogElement>) => ReactNode;
  onClose?: () => void;
  onSubmit?: (courseData: Course) => void;
} & (
  | {
      mode: 'edit';
      courseData: Course;
    }
  | {
      mode: 'create';
      courseData?: Partial<Course> | undefined;
    }
  | {
      mode: 'read';
      courseData: Course;
    }
);

type FormData = Omit<Course, 'time'> & {
  time: {
    day: number;
    start: string;
    end: string;
  };
};

export default function CourseDialog({
  courseData,
  mode,
  renderTrigger,
  onClose,
  onSubmit,
}: CourseDialogProps) {
  const { labels } = useLabel();
  const dialogRef = useRef<HTMLDialogElement>(null);

  function closeDialog() {
    dialogRef.current?.close();
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  const days = [
    labels.SUNDAY,
    labels.MONDAY,
    labels.TUESDAY,
    labels.WEDNESDAY,
    labels.THURSDAY,
    labels.FRIDAY,
    labels.SATURDAY,
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    disabled: mode === 'read',
    defaultValues: {
      type: CourseType.Lecture,
      ...courseData,
      time: {
        day: courseData?.time?.day ?? undefined,
        start: courseData?.time?.start
          ? floatToHHMM(courseData?.time.start)
          : undefined,
        end: courseData?.time?.end
          ? floatToHHMM(courseData.time.end)
          : undefined,
      },
    },
    mode: 'onTouched',
  });

  async function submitHandler(formData: FormData) {
    const courseData: Course = {
      ...formData,
      code: formData.code,
      time: {
        day: formData.time.day,
        start: formData.time.start ? hhmmToFloat(formData.time.start) : null,
        end: formData.time.end ? hhmmToFloat(formData.time.end) : null,
      },
    };

    if (!courseData.id) {
      courseData.id = uuid();
    }

    if (typeof onSubmit === 'function') {
      setTimeout(() => {
        onSubmit(courseData);
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
        className="modal text-base-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
              <Cross1Icon width={20} height={20} />
            </button>
          </form>
          <h3 className="text-lg font-bold">
            {mode === 'edit' && `${labels.EDIT_COURSE} (${courseData.code})`}
            {mode === 'create' && `${labels.CREATE_COURSE}`}
            {mode === 'read' && courseData.code}
          </h3>

          <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex flex-col gap-3"
          >
            <div>
              {mode === 'create' && (
                <FormField
                  label={labels.CODE}
                  errorMessage={errors.code?.message}
                >
                  <Input
                    readOnly
                    className="input-disabled w-full"
                    placeholder={labels.CODE}
                    aria-invalid={!!errors.code}
                    {...register('code')}
                    value={courseData?.code}
                  />
                </FormField>
              )}

              <FormField
                label={labels.TYPE}
                errorMessage={errors.type?.message}
              >
                <select
                  className="select select-bordered select-sm"
                  {...register('type', {
                    valueAsNumber: true,
                  })}
                  aria-invalid={!!errors.type}
                >
                  <option value={CourseType.Lecture}>{labels.LECTURE}</option>
                  <option value={CourseType.Practice}>{labels.PRACTICE}</option>
                </select>
              </FormField>

              <FormField
                label={labels.INSTRUCTOR}
                errorMessage={errors.instructor?.message}
              >
                <Input
                  className="w-full"
                  placeholder={labels.INSTRUCTOR}
                  aria-invalid={!!errors.instructor}
                  {...register('instructor')}
                />
              </FormField>

              <FormField
                label={labels.PLACE}
                errorMessage={errors.place?.message}
              >
                <Input
                  className="w-full"
                  placeholder={labels.PLACE}
                  aria-invalid={!!errors.place}
                  {...register('place')}
                />
              </FormField>

              <div className="flex gap-2">
                <FormField
                  label={labels.DAY}
                  errorMessage={errors.time?.day?.message}
                >
                  <select
                    className="select select-bordered select-sm"
                    {...register('time.day', {
                      valueAsNumber: true,
                    })}
                    aria-invalid={!!errors.time?.day}
                  >
                    {days.map((day, i) => (
                      <option key={day} value={i}>
                        {day}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label={labels.START}
                  errorMessage={errors.time?.start?.message}
                >
                  <Input
                    type="time"
                    aria-invalid={!!errors.time?.start}
                    {...register('time.start')}
                  />
                </FormField>

                {/* TODO: validate end > start */}
                <FormField
                  label={labels.END}
                  errorMessage={errors.time?.end?.message}
                >
                  <Input
                    type="time"
                    aria-invalid={!!errors.time?.end}
                    {...register('time.end')}
                  />
                </FormField>
              </div>

              <FormField
                className="w-min"
                label={labels.FIX}
                errorMessage={errors.fix?.message}
              >
                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    {...register('fix')}
                  />

                  <Tooltip
                    className="tooltip-right"
                    text={labels.FIX_TOOLTIP}
                  />
                </div>
              </FormField>

              <FormField
                className="w-min whitespace-nowrap"
                label={labels.ALLOW_OVERLAP}
                errorMessage={errors.allowOverlap?.message}
              >
                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    {...register('allowOverlap')}
                  />

                  <Tooltip
                    className="tooltip-right"
                    text={labels.ALLOW_OVERLAP_TOOLTIP}
                  />
                </div>
              </FormField>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                className="btn-ghost btn-outline btn-md"
                label={labels.CLOSE}
                onClick={() => {
                  closeDialog();
                }}
              />
              {mode !== 'read' && (
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
              )}
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
