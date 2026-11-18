import { router, useLocalSearchParams } from 'expo-router';

import { BeneficiaryForm, initialValues } from '@/components/beneficiary-form';
import { useToast } from '@/components/toast';
import { api, errorMessage } from '@/lib/api';

export default function NewBeneficiaryScreen() {
  const { cardUid } = useLocalSearchParams<{ cardUid?: string }>();
  const toast = useToast();
  return (
    <BeneficiaryForm
      title="Cadastrar novo assistido"
      initial={initialValues(null, cardUid)}
      submitLabel="Salvar cadastro"
      onSubmit={async (input, photo) => {
        const created = await api.createBeneficiary(input);
        if (photo) {
          try {
            await api.uploadPhoto(created.id, photo);
          } catch (e) {
            toast(`Cadastro salvo, mas a foto não foi enviada: ${errorMessage(e)}`, 'error');
          }
        }
        toast(`${created.code} cadastrado`);
        router.replace({ pathname: '/assistido/[id]', params: { id: created.id } });
      }}
    />
  );
}
