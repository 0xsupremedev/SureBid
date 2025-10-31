Intro
Sanctum Gateway
Sanctum Gateway is a high-performance API and dashboard to optimize, send, and observe Solana transactions. If your app triggers any transaction on Solana, you can route it through Gateway for higher reliability, and better visibility.

how-it-works.png

Getting Started
Quickstart
A concise guide to quickly integrate Gateway into your workflow

Follow these steps:
Sign Up

Sign Up: Create an account on the Gateway platform.
Set Up Organization and Project:
Create an organization to manage multiple projects.
Create projects within your organization to isolate and manage different use-cases, ensuring clear isolation, per-project analysis and optimized resource management.
Add Delivery Methods

A Delivery Method is where Gateway would send transactions to. You can add multiple delivery methods to get better transaction landing rates.
Here’s how to set up a delivery method:
1
Navigate to Dashboard > Delivery Methods

This page shows you all the methods created and linked to the current project
Screenshot 2025-06-25 at 1.20.48 PM.png
2
Create a Delivery Method

In the dialog, select the type of delivery method, cluster and add it’s name and endpoint URL
Screenshot 2025-06-25 at 1.21.45 PM.png
3
Add to Project

Once created, click on “Add to Project” to link it to the current project
Screenshot 2025-06-25 at 1.23.10 PM.png
Click here to quickly navigate to this page
Copy API Key

API Keys allows you to authenticate and connect your code to Gateway. A default API key has already been created for your project.
Here’s how you can get an API Key:
1
Navigate to Dashboard > API Keys

This page shows you all the API keys created for the project. You can copy the default key or add additional keys as shown below
Screenshot 2025-07-10 at 12.47.23 PM.png
2
Create an additional API Key

In the dialog, add the name of your API key. You can create multiple API keys to be used in different environments
Screenshot 2025-06-25 at 1.28.10 PM.png
Click here to quickly navigate to this page
Integration

Now that you’ve set up your Project and API Key, you can authenticate requests to Gateway by supplying the cluster and the key on the query parameters.
Click here to learn more about the endpoints and how to use them.
​
Next Steps
Learn how to set up your project here
Learn how to integrate Gateway endpoints here
Sanctum Gateway

Getting Started
Delivery Methods
A delivery method enables Gateway to send transactions to the Solana network.

Gateway categorises the various of ways of sending transactions to the Solana network as Delivery Methods. They are as follows,
RPCs/SWQoS
Jito Bundles
Transaction Senders, such as Sanctum Sender, Nozomi, etc.
Gateway allows you to configure appropriate delivery methods based on your project’s requirements, which are then used to send your transactions to the Solana network.
The delivery methods currently supported by Gateway are as follows,
​
RPCs/SWQoS
RPCs are the most common way of sending transactions to Solana nodes. You can an RPC URL for many RPC providers such as Triton One, Quicknode, etc.
One can also use set up SWQoS solutions such as Triton Cascade to use with Gateway.
​
Configuration for RPC:
Name: Identifier for this method.
Cluster: Select between devnet (for testing) or mainnet.
URL: Endpoint URL of the RPC node. Any URL that supports sendTransaction JSON-RPC method and requires no additional tip of any sorts will work here.
​
Jito Bundles
Jito is an enhanced validator client (Jito-Solana) that allows transactions to be bundled and sent through Jito’s Block Engine using relays. These bundles participate in an auction, where the amount tipped determines which transactions are included on the network.
Since most Solana validators now run Jito, transactions delivered via this method benefit from much faster execution and higher success rates at the price of an additional tip.
Gateway sends each of your transactions as individual Jito bundles which include a refundable tip. You can leverage this along with sending transactions to RPCs to not only increase landing rates but also lower your tip expenses.
​
Configuration for Jito:
Name: Identifier for this method.
Region or URL:
Select a predefined region to use Jito’s default endpoints (Rate limit: 1 request per second)
Provide your custom Jito endpoint URL for higher throughput without enforced rate-limiting.
​
Astralane Sender
Astralane routes through their partner SWQoS clients, including Jito and Paladin, ensuring optimized transaction processing and maximum reliability.
​
Configuration for Astralane:
Name: Identifier for this method.
API Key: Provide your API Key for using Astralane’s endpoints
Region: Select from one of the predefined regions to use Astralane’s endpoints
​
Sanctum Sender
Sanctum Sender is Sanctum’s transaction submission service. It optimizes transaction submission by leveraging SWQoS and Jito simultaneously, providing multiple pathways for your transactions to be included in blocks.
All new projects on Gateway are provider with a Sanctum Sender delivery method by default, making it the easiest way for teams to start sending transactions.
There is currently only one global URL for using Sanctum Sender. Hence, no further configuration is required.
​
Helius Sender
Helius Sender is Helius’ transaction submission service. It optimizes transaction latency by sending to both Solana validators and Jito simultaneously, providing multiple pathways for your transactions to be included in blocks.
​
Configuration for Helius Sender:
Name: Identifier for this method.
Region:
Select a predefined region to use Helius endpoints (Rate limit: 15 TPS)
Quickstart
Project Parameters
Ask a question...

x
github

Getting Started
Project Parameters
Configuring parameters that determine how your transactions are optimized and delivered using Gateway

Parameters enable optimizations and incident management for your transactions on the fly—without having to redeploy your project. Changes take effect in real time, allowing you to fine-tune configurations based on performance feedback.
The network can often become congested during times of high usage, leading to a noticeable drop in transaction landing rates. During such instances, you can now simply update your parameters to increase the chances of your transactions landing.
The parameters currently available are as follows,
​
Compute Unit (CU) Price:
This parameter allows you to select the amount of price per compute unit you wish to pay. Each range corresponds to a percentile of CU Price paid in transactions that have landed previously on the Solana network:
Low: 10th percentile
Median: 50th percentile
High: 90th percentile
​
Jito Configuration:
Tip Amount: Select the tip amount for your transaction from these options:
Low: 25th percentile
Median: 50th percentile
High: 75th percentile
MAX: 99th percentile
Delivery Delay: Use this to set how long Gateway waits (in milliseconds) before sending transactions to Jito after attempting RPC delivery. If a transaction is successfully delivered via RPC, the Jito tip is refunded automatically.
​
Delivery Methods:
This section allows you to select and manage delivery methods from your organization for the current project.
Creating a delivery method from the parameters sidebar automatically links it to the current project. Once linked, this delivery method will be utilized whenever delivery requests are made for this specific project.
Delivery methods created from the delivery methods page will be available organization-wide but won’t be linked automatically to any specific project. They must be manually linked to be utilized for delivery requests.
You can manage linked delivery methods in two ways:
Unlinking a delivery method removes it from the current project but keeps it accessible for use in other projects within your organization.
Deleting a delivery method permanently removes it from your entire organization and all associated projects.
​
Transaction Routing
This parameter helps you to build your transactions so that one can distribute their transaction traffic between multiple delivery methods.
Gateway currently uses a weighted sampling algorithm for distributing your transaction traffic. Depending on the weights one configures, the getTipInstructions and buildGatewayTransaction JSON-RPC methods respond with appropriate tip instructions and transaction respectively.
The following image depicts how one would configure their weights to route 50% of their transactions to Sanctum Sender, 30% to regular RPCs and 20% to any other configured transaction sender,
Transaction Routing Pn
​
Transaction Expiry:
This parameter allows you to configure your transaction to expire in the specified amount of slots. This is done by setting a latestBlockhash for your transaction according to your configuration.
Since every transaction, by default, is valid for 150 blocks starting from the blockhash set in the transaction, we can thus calculate which blockhash to use so that your transaction expires in the specified number of slots.
​
Next Steps
Learn how to integrate Gateway endpoints here
Learn how to build your transactions here
Delivery Methods
Gateway Endpoints
Ask a question...

x
github

Getting Started
Gateway Endpoints
The Transaction Processing Gateway (TPG) is accessible via secure HTTP endpoints.

​
Endpoint URL Structure

Copy

Ask AI
https://tpg.sanctum.so/v1/{cluster}?apiKey={apiKey}
​
Path Parameters
​
{cluster} (required)
Specifies the Solana cluster targeted for transactions.
Supported Clusters:
Cluster Value	Description
mainnet	Solana Mainnet Beta
devnet	Solana Development Network
​
Query Parameters
​
apiKey (required)
The unique authentication key assigned to your project.
Example:

Copy

Ask AI
01ARZ3NDEKTSV4RRFFQ69G5FAV
​
Usage Example
Below is a basic example demonstrating how to build a transaction:

Copy

Ask AI
const response = await fetch('https://tpg.sanctum.so/v1/mainnet?apiKey=your-api-key', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    method: 'buildGatewayTransaction',
    params: [getBase64EncodedWireTransaction(transaction)],
  })
});
​
Security Best Practices
Protecting Your API Key:
Do not expose API keys in client-side code, repositories, or publicly accessible areas.
Store API keys using environment variables or dedicated secrets management tools.
Maintain separate API keys for distinct environments (development, staging, production).
​
Next Steps
Learn how to build your transactions here
Learn how to deliver transactions here
Project Parameters
Builder
Ask a question...

x
github

Concepts
Builder
The Builder stage helps you to build your transactions to be sent via Gateway

This stage consists of the following JSON-RPC methods,
buildGatewayTransaction
getTipInstructions
This set of JSON-RPC methods allow users to abstract the complexity of building transactions according to the delivery method, such as Jito Bundles, Sanctum Sender etc, and allows users to update how their transaction traffic is routed in real-time, without any code changes or redeployments.
This stage is optional and users can manually handle building the transactions appropriately, to be sent via Gateway.
​
buildGatewayTransaction
This method acceps an existing transaction and returns an updated transaction that is ready to be sent to Gateway.
One can use the buildGatewayTransaction method to do the following:
Simulate the transaction for preflight checks, and get an estimate of the CUs consumed to set the CU limit accordingly.
Fetch the latest prioritization fees for the transaction, and set the CU price accordingly.
Add the tip instructions to route the trasaction to the desired delivery methods.
Set the appropriate latestBlockhash for the transaction, depending on whether you want the transaction to expire sooner than usual.

Copy

Ask AI
import {
  appendTransactionMessageInstructions,
  blockhash,
  compileTransaction,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  getBase64Encoder,
  getTransactionDecoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransaction,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

export const GATEWAY_ENDPOINT = `https://tpg.sanctum.so/v1/mainnet?apiKey=${process.env.GATEWAY_API_KEY}`;

// Random source and destination used for example
const { alice, bob } = await getAccounts();

const transferIx = getTransferSolInstruction({
  source: alice,
  destination: bob,
  amount: 1000n,
});

const unsignedTransaction = pipe(
  createTransactionMessage({ version: 0 }),
  (txm) => appendTransactionMessageInstructions([transferIx], txm),
  (txm) => setTransactionMessageFeePayerSigner(alice, txm),
  // Since `buildGatewayTransaction` will set the blockhash for you,
  // We can avoid fetching the latest blockhash here
  (m) =>
    setTransactionMessageLifetimeUsingBlockhash(
      {
        blockhash: blockhash("11111111111111111111111111111111"),
        lastValidBlockHeight: 1000n,
      },
      m
    ),
  compileTransaction
);

const buildGatewayTransactionResponse = await fetch(GATEWAY_ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "startup-village",
    jsonrpc: "2.0",
    method: "buildGatewayTransaction",
    params: [
      getBase64EncodedWireTransaction(unsignedTransaction),
      {
        // encoding: "base64" | "base58", default is "base64"
        // skipSimulation: boolean, if true, you need to set the CU limit yourself since simulation allows to find out cu consumed.
        // skipPriorityFee: boolean, if true, you need to set the CU price yourself. Use Triton Priority Fee API
        // cuPriceRange: "low" | "medium" | "high", defaults to project parameters
        // jitoTipRange: "low" | "medium" | "high" | "max", defaults to project parameters
        // expireInSlots: number, defaults to project parameters
        // deliveryMethodType: "rpc" | "jito" | "sanctum-sender" | "helius-sender", defaults to project parameters
      },
    ],
  }),
});

if (!buildGatewayTransactionResponse.ok) {
  throw new Error("Failed to build gateway transaction");
}

const {
  result: { transaction: encodedTransaction },
} = (await buildGatewayTransactionResponse.json()) as {
  result: {
    transaction: string;
    latestBlockhash: {
      blockhash: string;
      lastValidBlockHeight: string;
    };
  };
};

const transaction = getTransactionDecoder()
  .decode(getBase64Encoder().encode(encodedTransaction));

const signedTransaction = await signTransaction([alice.keyPair], transaction);

const sendTransactionResponse = await fetch(GATEWAY_ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "startup-village",
    jsonrpc: "2.0",
    method: "sendTransaction",
    params: [getBase64EncodedWireTransaction(signedTransaction)],
  }),
});

if (!sendTransactionResponse.ok) {
  throw new Error("Failed to send transaction");
}

const data = await sendTransactionResponse.json();

console.log(data);
​
getTipInstructions
This method returns the tip instructions that need to be added to your transaction depending on what delivery method this transaction needs to be sent to.
One can either explicitly specify the delivery method for which to return the tip instructions for, or Gateway will use a weighted sampling algorithm to pick one depending on the Transaction Routing parameter configured on the Dashboard.

Copy

Ask AI
import {
  appendTransactionMessageInstructions,
  compileTransaction,
  createSolanaRpc,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  type IInstruction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransaction,
} from "@solana/kit";
import {
  getSetComputeUnitLimitInstruction,
  getSetComputeUnitPriceInstruction,
} from "@solana-program/compute-budget";
import { getTransferSolInstruction } from "@solana-program/system";
import { getAccounts, getTritonPrioritizationFees } from "./utils.js";

export const GATEWAY_ENDPOINT = `https://tpg.sanctum.so/v1/mainnet?apiKey=${process.env.GATEWAY_API_KEY}`;

// Random source and destination used for example
const { alice, bob } = await getAccounts();

const rpc = createSolanaRpc(process.env.RPC_URL as string);

const transferIx = getTransferSolInstruction({
  source: alice,
  destination: bob,
  amount: 1000n,
});

// Fetch latest blockhash, CU price and getTipInstructions response
const [{ value: latestBlockhash }, cuPrice, getTipInstructionsResponse] =
  await Promise.all([
    rpc.getLatestBlockhash().send(),
    getTritonPrioritizationFees([alice.address, bob]),
    fetch(GATEWAY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "demo",
        jsonrpc: "2.0",
        method: "getTipInstructions",
        params: [
          {
            feePayer: alice.address,
            // jitoTipRange: "low" | "medium" | "high" | "max", defaults to project parameters
            // deliveryMethodType: "rpc" | "jito" | "sanctum-sender" | "helius-sender", defaults to project parameters
          },
        ],
      }),
    }),
  ]);

if (!getTipInstructionsResponse.ok) {
  throw new Error("Failed to get tip instructions");
}

// Parse tip instructions response and convert to Instruction[]
const tipIxs: IInstruction[] = [];
const tipIxsData = await getTipInstructionsResponse.json();
for (const ix of tipIxsData.result) {
  tipIxs.push({
    ...ix,
    data: new Uint8Array(Object.values(ix.data)),
  });
}

// Hardcode CU limit, but you can also simulate the transaction to get the exact CU limit
const cuLimitIx = getSetComputeUnitLimitInstruction({
  units: 800,
});

const cuPriceIx = getSetComputeUnitPriceInstruction({
  microLamports: cuPrice,
});

const transaction = pipe(
  createTransactionMessage({ version: 0 }),
  (txm) =>
    appendTransactionMessageInstructions(
      [cuLimitIx, cuPriceIx, transferIx, ...tipIxs],
      txm
    ),
  (txm) => setTransactionMessageFeePayerSigner(alice, txm),
  (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
  compileTransaction
);

const signedTransaction = await signTransaction([alice.keyPair], transaction);

const sendTransactionResponse = await fetch(GATEWAY_ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "demo",
    jsonrpc: "2.0",
    method: "sendTransaction",
    params: [getBase64EncodedWireTransaction(signedTransaction)],
  }),
});

if (!sendTransactionResponse.ok) {
  throw new Error("Failed to send transaction");
}

const data = await sendTransactionResponse.json();

console.log(data);
Gateway Endpoints
Delivery
Ask a question...

x
github

Concepts
Delivery
Gateway enables seamless switching and routing between various delivery methods

This feature is accessible via sendTransaction method.
Gateway delivers transactions simultaneously across multiple delivery methods, maximizing transaction success rates. Effortlessly switch between delivery channels from your dashboard—no code changes or redeployments required.
Once you have your optimized transaction ready along with the tip transfer included, you can now send it via the sendTransaction method.
Gateway expects a minimal tip of 50K Lamports for delivery (or based on the methods used). Please ensure your transaction includes a transfer instruction to one of our Tip destinations

(Ignore if you’re using one of our builder endpoints)
​
Supported Encoding Formats
Transactions are accepted in both base64 and base58 encoding formats.
base58 is being deprecated from Solana and could be removed as an acceptable encoding in the future. It it advised to use base64
​
Tracking Slot Latency
As we route your transaction through your chosen delivery methods, we record the slot at which each transaction is sent. This allows us to accurately calculate slot latency for your transactions.
For even more precise end-to-end latency tracking from your application, you can include a startSlot value in your request body. We’ll use this value to determine the slot latency on your behalf.
We’ve recently introduced a v1 set of of APIs, and hence please note the URL below with the /v1 path parameter.
​
Request Example

Copy

Ask AI
import {
  getBase64Encoder,
  getTransactionDecoder,
  getBase64EncodedWireTransaction
} from "@solana/kit";

// Continued from `buildGatewayTransaction`...
const optimizedTxString = optimizeBody.result.transaction;
const optimizedTx = getTransactionDecoder()
    .decode(getBase64Encoder().encode(optimizedTxString));

const signedTx = await signTransaction([keyPair], optimizedTx);

const deliveryResponse = await fetch(`${GATEWAY_URL}/v1/mainnet?apiKey=${apiKey}`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'}
  body: JSON.stringify({
    id: "test-id",
    jsonrpc: "2.0",
    method: "sendTransaction",
    params: [getBase64EncodedWireTransaction(signedTx), {
        encoding: "base64",
		startSlot: 361082604
    }]
  }),
});
​
Response Example
The response contains results from each delivery method indexed using its URL.

Copy

Ask AI
type DeliveryResult = {
  result?: string; // Transaction signature
  error?: {
    code: number,
	message: string
  }
};

Copy

Ask AI
{
  "jsonrpc": "2.0",
  "id": "test-id",
  "result": "E7oKpwds2h4xxcrGoccrizTEVWvgu6k8u..."
}
In this example, the response includes either a result field with the transaction signature or an error field with error details.
Builder
Observability
Ask a question...

x
github

Concepts
Observability
Monitor transaction flows in real-time with intuitive visual analytics, immediately identify performance bottlenecks, and update parameters to improve transaction success rates easily

observe.png
The Sankey chart above illustrates the distribution of transactions processed through each delivery method,mapping each to its eventual landing status.
Additionally, you can also monitor the following data:
Transactions Sent: The number of transactions being sent from your project
Landing Rate: The proportion of landed transactions relative to the total number of transactions sent.
Priority Fees: The amount of priority fees consumed by transactions
Fee Breakdown: The time series chart of the distribution of fees
Delivery Type: The time series chart of the delivery methods being used
Slot Latency: The time series chart of the slot latency of transactions
​
What should I do if my landing rates are down?
In an event of high usage, the network can be congested and transactions can be difficult to land. In this scenario, you can do the following to improve reliability of your project:
Increase the priority fee and/or the Jito Tip range
Update delivery methods
Check logs for more details on the failed transactions
Delivery
Optimization
Ask a question...

x
githubConcepts
Observability
Monitor transaction flows in real-time with intuitive visual analytics, immediately identify performance bottlenecks, and update parameters to improve transaction success rates easily

observe.png
The Sankey chart above illustrates the distribution of transactions processed through each delivery method,mapping each to its eventual landing status.
Additionally, you can also monitor the following data:
Transactions Sent: The number of transactions being sent from your project
Landing Rate: The proportion of landed transactions relative to the total number of transactions sent.
Priority Fees: The amount of priority fees consumed by transactions
Fee Breakdown: The time series chart of the distribution of fees
Delivery Type: The time series chart of the delivery methods being used
Slot Latency: The time series chart of the slot latency of transactions
​
What should I do if my landing rates are down?
In an event of high usage, the network can be congested and transactions can be difficult to land. In this scenario, you can do the following to improve reliability of your project:
Increase the priority fee and/or the Jito Tip range
Update delivery methods
Check logs for more details on the failed transactions
Delivery
Optimization
Ask a question...

x
github

Concepts
Optimization
The Optimization stage takes care of simulating your transactions and preparing it to be delivered via your delivery methods.

This page is now deprecated. We’ve now replaced this with our new Builder Stage API
This stage is accessible via optimizeTransaction JSON-RPC method.
​
Optimization involves:
Transaction Simulation:
Ensures transaction validity.
Calculates the total compute units (CU) required for the transaction.
Configuring Compute Budget:
Allocating Compute Units: Sets an upper limit on the compute units your transaction can use in a block, increasing its likelihood of being included.
Setting Compute Unit Price: Defines how much you pay per CU, based on the project/request configuration and the network status, influencing the transaction’s priority.
Priority Fee Determination: The combination of CU allocation and price determines the transaction’s overall Priority Fee,

Copy

Ask AI
Priority Fee = CU Limit * CU Price
If the transaction already has their own CU allocation and compute budget, Gateway retains the pre-defined values instead of overriding them.
Prepare Tip Instruction:
Gateway also adds an extra Transfer instruction to your transaction to charge a fee to the fee payer of the transactions. This fee involves the following,
Gateway Tip: 25% of the priority fees being paid by your transaction is charged as fees for using Gateway’s services.
Jito Bundle Tip: If your project is set up to use Jito bundles or you specify a delivery method override in your request, Gateway will automatically add a tip to the instruction according to your project settings or the override. If the transaction ends up being delivered via RPC instead of Jito, the tip is refunded back to the fee payer automatically—no additional action required on your part.
Set Latest Blockhash:
If the Transaction Expiry parameter is configured, then we fetch the blockhash accordingly, orelse we fetch the latest blockhash and set it for your transaction before returning it back in the response.
​
Encoding Information
Transactions can be submitted in base64 or base58 formats, but optimized transactions will be returned encoded in base64 format by default.
base58 is being deprecated from Solana and could be removed as an acceptable encoding in the future. It it advised to use base64
​
Request and Response Structure
Submit transactions in the request body encoded appropriately, along with optional priority fee parameters.
​
Request Example

Copy

Ask AI
import { getBase64EncodedWireTransaction } from "@solana/kit";

const optimizeResponse = await fetch(`${GATEWAY_URL}/mainnet?apiKey=${apiKey}`, {
  method: 'POST',
  body: JSON.stringify({
    id: "test-id",
    jsonrpc: "2.0",
    method: "optimizeTransaction",
    params: {
      transactions: [
        {
          params: [
            getBase64EncodedWireTransaction(tx),
            // Optionally override the Project Configuration
            { cuPriceRange: "high", jitoTipRange: "high", expireInSlots: 5, encoding: "base64" }
          ],
        },
      ],
    }
  }),
  headers: {'Content-Type': 'application/json'}
});
​
Response
The response includes the optimized transaction encoded as a base64 string, along with the latestBlockhash that can be used to verify transaction confirmation.
The response structure:

Copy

Ask AI
{
  transaction: string, // base64 encoded optimized transaction
  latestBlockhash: {
    blockhash: string,
    lastValidBlockHeight: string // Note: This is returned as a string
  }
}
Convert the optimized transaction into a Transaction object using @solana/web3.js or @solana/kit and sign it for execution:

Copy

Ask AI
import {
  signTransaction,
  getBase64Encoder,
  getTransactionDecoder
} from "@solana/kit";

const optimizeBody = await optimizeResponse.json();
const optimizedTxString = optimizeBody.result[0].transaction;
const latestBlockhash = optimizeBody.result[0].latestBlockhash;

// Decode and sign the optimized transaction
const optimizedTx = getTransactionDecoder()
    .decode(getBase64Encoder().encode(optimizedTxString));

const signedTx = await signTransaction([keyPair], optimizedTx);

// The latestBlockhash can be used later to verify transaction confirmation
// blockhash: latestBlockhash.blockhash
// lastValidBlockHeight: Number(latestBlockhash.lastValidBlockHeight)
​
Self Optimization
If you only wish to use our delivery mechanism through sendOptimizedTransaction, transactions may also be self-optimized. All thats needed for delivery is the proper tip configuration for Gateway and Jito (if applicable).
Here’s how you can set up your transactions for delivery:

Copy

Ask AI
import { getTransferSolInstruction } from "@solana-program/system";
import {
  pipe,
  address,
  createSolanaRpc,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  createKeyPairSignerFromBytes,
  compileTransaction,
  appendTransactionMessageInstruction
} from "@solana/kit";

// 150 for each of the transfer, cuLimit, and cuPrice instructions
const EXTRA_CU_CONSUMED = 150 + 150 + 150;

const TIP_DESTINATIONS = [...]; // Found at Misc/Tip-Accounts
const tipDestination = TIP_DESTINATIONS[
	Math.floor(Math.random() * TIP_DESTINATIONS.length)
];

function getGatewayTip(cuPrice: bigint, cuLimit: bigint) {
  // 25% of priority fee
  const priorityFeeMicroLamports = cuPrice * cuLimit;
  const gatewayFeeMicroLamports = (priorityFeeMicroLamports * 25n) / 100n;
  const gatewayFeeLamports = Math.round(Number(gatewayFeeMicroLamports) / 1_000_000);
  return BigInt(gatewayFeeLamports);
}

// Replace with your own values
const feePayer = await createKeyPairSignerFromBytes(new Uint8Array());
const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com");

const initialMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (m) => setTransactionMessageFeePayer(feePayer.address, m),
  (m) =>
    setTransactionMessageLifetimeUsingBlockhash(
      {
        blockhash: (await rpc.getLatestBlockhash().send()).value.blockhash,
        lastValidBlockHeight: 1000n,
      },
      m
    ),
  // Your instructions here
);

const initialTx = await compileTransaction(initialMessage);

const simulation = await rpc.simulateTransaction(
  getBase64EncodedWireTransaction(initialTx), {
    encoding: "base64",
    sigVerify: false,
  }
).send();

if (simulation.value.unitsConsumed === undefined) {
  throw new Error("Simulation failed");
}

// Derived from the tx simulation
const txCuLimit = BigInt(simulation.value.unitsConsumed) + BigInt(EXTRA_CU_CONSUMED);
// Fetch from a Priority Fee API of your choice, Helius, Triton etc.
const txCuPrice = BigInt(...);

const gatewayTip = getGatewayTip(txCuPrice, txCuLimit);

// Fetch from Jito Tip Floor API if using Jito Bundles
const jitoTipFloor = BigInt(...);
const totalTip = gatewayTip + jitoTipFloor;

// Add this tip instruction to the transaction
const tipIx = getTransferSolInstruction({
  source: feePayer,
  destination: address(tipDestination),
  amount: totalTip,
});

const preparedTxForDelivery = pipe(
  initialMessage,
  (m) => appendTransactionMessageInstruction(tipIx, m),
  (m) => setTransactionMessageLifetimeUsingBlockhash(
    {
      blockhash: (await rpc.getLatestBlockhash().send()).value.blockhash,
      lastValidBlockHeight: 1000n,
    },
    m
  ),
  compileTransaction,
);

// Use this encoded transaction with `sendOptimizedTransaction` method
const encodedTx = getBase64EncodedWireTransaction(preparedTxForDelivery);
Tip Accounts can be found here.
Observability
Tip Accounts
Ask a question...

x
github

Misc
Rate Limits
Sanctum Gateway rate limits details

We currently have a rate limit of 30 requests for every 10 seconds globally. Based on your project requirements, we’ll be happy to update or amend this limit.
Tip Accounts
Press Kit
Ask a question...

x
github