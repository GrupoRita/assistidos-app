import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { BeneficiaryForm, initialValues } from '@/components/beneficiary-form';
import { useToast } from '@/components/toast';
import { Empty } from '@/components/ui';
import { useAsync } from '@/hooks/use-async';
import { api } from '@/lib/api';
import { colors } from '@/lib/theme';

export default function EditBeneficiaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const { data, error } = useAsync(() => api.getBeneficiary(id), [id]);

  if (!data) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {error ? <Empty>{error}</Empty> : <ActivityIndicator color={colors.nfc} />}
      </View>
    );
  }

  return (
    <BeneficiaryForm
      key={data.id}
      title="Alterar dados do assistido"
      initial={initialValues(data)}
      photoUrl={data.photoUrl}
      submitLabel="Salvar alterações"
      onSubmit={async (input, photo) => {
        await api.updateBeneficiary(data.id, input);
        if (photo) await api.uploadPhoto(data.id, photo);
        toast('Dados atualizados');
        router.back();
      }}
    />
  );
}
