import { Stethoscope } from 'lucide-react';
import { RoleHomePlaceholder } from '@/presentation/home/RoleHomePlaceholder';

export default function DoctorHomePage() {
  return (
    <RoleHomePlaceholder
      icon={<Stethoscope className="h-7 w-7" aria-hidden="true" />}
      title="Profesional de salud"
      subtitle="Tu panel de seguimiento clínico y evidencia está casi listo."
    />
  );
}
