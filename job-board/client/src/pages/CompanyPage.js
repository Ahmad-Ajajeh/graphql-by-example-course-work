import { useParams } from "react-router";
import JobList from "../components/JobList";
import { useCompany } from "../lib/graphql/hooks";

function CompanyPage() {
  const { companyId } = useParams();

  const { company, loading, error } = useCompany(companyId);

  // old appraoch : not using useQuery .
  // const [state, setState] = useState({
  //   loading: true,
  //   company: null,
  //   error: false,
  // });

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const company = await fetchCompany(companyId);
  //       setState({ loading: false, error: false, company });
  //     } catch (error) {
  //       setState({ loading: false, company: false, error: true });
  //     }
  //   })();
  // }, [setState, companyId]);

  // const { loading, error, company } = state;

  if (loading) return <div>Loading ...</div>;

  if (error) return <div className="has-text-danger">Data Unavailabe</div>;

  return (
    <>
      <div>
        <h1 className="title">{company.name}</h1>
        <div className="box">{company.description}</div>
      </div>
      <h2 className="title is-5">Jobs from {company.name}</h2>
      <JobList jobs={company.jobs} />
    </>
  );
}

export default CompanyPage;
