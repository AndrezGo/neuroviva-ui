import { User } from 'lucide-react';
import { RoleHomePlaceholder } from '@/presentation/home/RoleHomePlaceholder';

export default function PatientHomePage() {
  return (
    <RoleHomePlaceholder
      icon={<User className="h-7 w-7" aria-hidden="true" />}
      title="Paciente"
      subtitle="Tu espacio de bienestar, recursos y tranquilidad está casi listo."
    />
  );
}
