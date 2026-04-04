import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';

import { FormInput } from '@/constants/form.constant';
import { USER_NAME_MIN, USER_NAME_MAX } from '#shared/constants/user.constant';

export const useAuthUpdateProfile = () => {
  const emit = getCurrentInstance()!.emit;

  const { t: $t } = useI18n();

  const { updateAuthUser } = useAuth();

  const { requiredMessage, minMessage, maxMessage } = useFormMessage();

  const isLoadingUpdateProfile: Ref<boolean> = ref(false);

  const UpdateProfileSchema = z.object({
    name: z
      .string({
        required_error: requiredMessage(FormInput.NAME)
      })
      .min(USER_NAME_MIN, {
        message: minMessage(FormInput.NAME, USER_NAME_MIN)
      })
      .max(USER_NAME_MAX, {
        message: maxMessage(FormInput.NAME, USER_NAME_MAX)
      })
      .trim()
  });

  const validationSchema = toTypedSchema(UpdateProfileSchema);
  const updateProfileForm = useForm({ validationSchema });

  const updateProfile = updateProfileForm.handleSubmit(async ({ name }) => {
    if (isLoadingUpdateProfile.value) return;

    isLoadingUpdateProfile.value = true;

    const { error } = await updateAuthUser({ name });

    isLoadingUpdateProfile.value = false;

    if (error) updateProfileForm.setErrors({ name: error.message });
    else {
      closeUpdateProfile();

      toast.success($t('toast.auth.settings.profile.title'), {
        description: name
      });
    }
  });

  const closeUpdateProfile = () => {
    emit('close-update-profile');

    updateProfileForm.resetForm();
  };

  return {
    isLoadingUpdateProfile,
    updateProfile,
    closeUpdateProfile
  };
};
