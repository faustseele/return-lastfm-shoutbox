import { render } from 'preact';
import { Popup } from '@/components/Popup';

/** mounts Popup component into #app root */
const root = document.getElementById('app');
if (!root) throw new Error('missing #app root');
render(<Popup />, root);
