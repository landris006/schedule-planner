import { Cross1Icon, Pencil1Icon } from '@radix-ui/react-icons';
import Button from './button';
import { ReactNode, useRef } from 'react';
import { useLabel } from '@/contexts/label/label-context';
import { useForm } from 'react-hook-form';
import FormField from './form-field';
import Input from './input';
import { Course, CourseType } from '@/contexts/subjects/subjects-context';
import { floatToHHMM, hhmmToFloat } from '@/utils';
import Tooltip from './tooltip';
import { usePlannerStore } from '@/stores/planner';
import React from 'react';

type CourseDialogProps = {
  renderTrigger?: (dialogRef: React.RefObject<HTMLDialogElement>) => ReactNode;
} & (
  | {
      mode: 'edit';
      courseData: Course;
    }
  | {
      mode: 'create';
      courseData?: undefined;
    }
  | {
      mode: 'read';
      courseData?: Course;
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
  courseData: courseToEdit,
  mode,
  renderTrigger,
}: CourseDialogProps) {
  const { labels } = useLabel();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { updateCourse } = usePlannerStore();

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
    formState: { errors },
  } = useForm<FormData>({
    disabled: mode === 'read',
    defaultValues: {
      type: CourseType.Lecture,
      ...courseToEdit,
      time: {
        day: courseToEdit?.time.day,
        start: courseToEdit?.time.start
          ? floatToHHMM(courseToEdit?.time.start)
          : undefined,
        end: courseToEdit?.time.end
          ? floatToHHMM(courseToEdit.time.end)
          : undefined,
      },
    },
    mode: 'onTouched',
  });

  async function submitHandler(formData: FormData) {
    const courseData: Course = {
      ...formData,
      time: {
        day: formData.time.day,
        start: formData.time.start
          ? hhmmToFloat(formData.time.start)
          : undefined,
        end: formData.time.end ? hhmmToFloat(formData.time.end) : undefined,
      },
    };

    if (mode === 'edit') {
      updateCourse(courseData);
    }

    dialogRef.current?.close();
  }

  return (
    <>
      {typeof renderTrigger === 'function' ? (
        renderTrigger(dialogRef)
      ) : (
        <Button
          className="btn-outline btn-info btn-sm"
          icon={<Pencil1Icon width={20} height={20} />}
          onClick={() => {
            dialogRef.current?.showModal();
          }}
        />
      )}
      <dialog ref={dialogRef} className="modal text-base-content">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
              <Cross1Icon width={20} height={20} />
            </button>
          </form>
          <h3 className="text-lg font-bold">
            {labels.EDIT_COURSE} ({courseToEdit?.code})
          </h3>

          <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex flex-col gap-3"
          >
            <div>
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
            </div>

            <div className="flex justify-end gap-3">
              <Button
                className="btn-ghost btn-outline btn-md"
                label={labels.CLOSE}
                onClick={() => {
                  dialogRef.current?.close();
                }}
              />
              {mode !== 'read' && (
                <Button
                  className="btn-primary btn-md"
                  label={labels[mode.toUpperCase() as Uppercase<typeof mode>]}
                  icon={<Pencil1Icon width={20} height={20} />}
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
