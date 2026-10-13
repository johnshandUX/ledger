import { BANK_BUSINESS_NAME } from "../../../src/finance/environment";
import { ProductShell } from "../../ProductShell";
import { PeopleAccessNavigation } from "./PeopleAccessNavigation";
import { UsersExperience } from "./UsersExperience";
import "./people-access.css";

export default function PeopleAccessPage() {
  return <ProductShell activeRoute="admin">
    <div className="people-access-page">
      <header className="people-access-header">
        <h1>People &amp; access</h1>
        <p>{`View the people who have access to ${BANK_BUSINESS_NAME}’s banking services, their banking roles and any additional access.`}</p>
      </header>
      <PeopleAccessNavigation active="users" />
      <UsersExperience />
    </div>
  </ProductShell>;
}
