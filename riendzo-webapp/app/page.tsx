import Ancient from './landingPage/history-ancient/ancient';
import Colonial from './landingPage/history-colonial/colonial';
import Independent from './landingPage/history-mz-independent/independent';
import RiendzoNavbar from './riendzo-navbar';

export default function Page() {
  return (
    <>
    <RiendzoNavbar />
    <Ancient/>
    <Colonial></Colonial>
    <Independent></Independent>
    </>
  );
}
