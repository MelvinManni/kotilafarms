"use client";
// Sign out, with a warning when entries haven't reached the farm records yet
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { useSignOut } from "@/hooks/use-sign-out";

export function SignOutPanel({ userId }: { userId: string }) {
  const { waiting, signOut } = useSignOut(userId);
  const [leaving, setLeaving] = useState(false);
  const leave = () => {
    setLeaving(true);
    void signOut();
  };
  return (
    <Panel title="Sign out" subtitle="Sign out on a phone other people use.">
      {waiting ? (
        <Notice tone="warning" icon="wifi-off" title={`${waiting} ${waiting === 1 ? "entry hasn’t" : "entries haven’t"} reached the farm records`}>
          They stay on this phone and send the next time you sign in with signal. Nobody else can sign in here until they have.
        </Notice>
      ) : null}
      <div>
        <Button variant="danger" onClick={leave} disabled={leaving}>{waiting ? "Sign out anyway" : "Sign out"}</Button>
      </div>
    </Panel>
  );
}
