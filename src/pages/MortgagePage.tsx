import { Page } from '../components/Layout';
import { MortgageTool, type InitialData } from '../tools/mortgage/MortgageTool';

export function MortgagePage({ initial }: { initial: InitialData }) {
  return (
    <Page current="/mortgage-or-isa/">
      <MortgageTool initial={initial} />
    </Page>
  );
}
